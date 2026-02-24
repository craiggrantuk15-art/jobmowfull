import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@12.0.0?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
    apiVersion: '2022-11-15',
    httpClient: Stripe.createFetchHttpClient(),
})

const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')

serve(async (req) => {
    const signature = req.headers.get('stripe-signature')

    if (!signature || !endpointSecret) {
        return new Response('Webhook Error: Missing signature or secret', { status: 400 })
    }

    let event
    const body = await req.text()

    try {
        event = await stripe.webhooks.constructEventAsync(
            body,
            signature,
            endpointSecret
        )
    } catch (err) {
        return new Response(`Webhook Error: ${err.message}`, { status: 400 })
    }

    const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object
                const organizationId = session.client_reference_id || session.metadata?.organization_id

                if (organizationId) {
                    const customerId = session.customer;
                    const subscriptionId = session.subscription;

                    // Update Organization Billing Details
                    await supabaseClient
                        .from('organizations')
                        .update({
                            billing_customer_id: customerId,
                            subscription_status: 'active'
                        })
                        .eq('id', organizationId);

                    // Create Subscription Record
                    if (subscriptionId) {
                        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
                        await supabaseClient
                            .from('subscriptions')
                            .upsert({
                                id: subscription.id,
                                organization_id: organizationId,
                                status: subscription.status,
                                price_id: subscription.items.data[0].price.id,
                                quantity: 1,
                                cancel_at_period_end: subscription.cancel_at_period_end,
                                created: new Date(subscription.created * 1000).toISOString(),
                                current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
                                current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                            });
                    }
                }
                break
            }
            case 'customer.subscription.updated':
            case 'customer.subscription.deleted': {
                const subscription = event.data.object;
                const organizationId = subscription.metadata?.organization_id;

                // If metadata is missing, we might need to look up via customer_id in organizations table
                // But for now, rely on metadata being set during creation.

                await supabaseClient
                    .from('subscriptions')
                    .upsert({
                        id: subscription.id,
                        organization_id: organizationId, // Might be null if not in metadata, handle with care?
                        status: subscription.status,
                        price_id: subscription.items.data[0].price.id,
                        quantity: 1,
                        cancel_at_period_end: subscription.cancel_at_period_end,
                        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
                        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                        ended_at: subscription.ended_at ? new Date(subscription.ended_at * 1000).toISOString() : null,
                        cancel_at: subscription.cancel_at ? new Date(subscription.cancel_at * 1000).toISOString() : null,
                        canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
                    })

                // Also update organization status
                if (organizationId) {
                    await supabaseClient
                        .from('organizations')
                        .update({ subscription_status: subscription.status })
                        .eq('id', organizationId);
                } else {
                    // Find org by customer id
                    const { data: org } = await supabaseClient
                        .from('organizations')
                        .select('id')
                        .eq('billing_customer_id', subscription.customer)
                        .single();

                    if (org) {
                        await supabaseClient
                            .from('organizations')
                            .update({ subscription_status: subscription.status })
                            .eq('id', org.id);

                        // Update subscription with org id if we missed it
                        await supabaseClient
                            .from('subscriptions')
                            .update({ organization_id: org.id })
                            .eq('id', subscription.id);
                    }
                }
                break
            }
        }
    } catch (error) {
        return new Response(`Webhook handler failed: ${error.message}`, { status: 400 })
    }

    return new Response(JSON.stringify({ received: true }), {
        headers: { 'Content-Type': 'application/json' },
    })
})
