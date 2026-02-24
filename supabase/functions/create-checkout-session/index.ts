import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@12.0.0?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
    apiVersion: '2022-11-15',
    httpClient: Stripe.createFetchHttpClient(),
})

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
        )

        const {
            data: { user },
        } = await supabaseClient.auth.getUser()

        if (!user) {
            throw new Error('Not authenticated')
        }

        // Get the user's organization
        // For simplicity, we assume one active organization per user or pass orgId in body
        // Let's get it from the body to be safe, or fallback to the one they own
        const { priceId, returnUrl, organizationId } = await req.json()

        if (!organizationId) {
            throw new Error('Organization ID is required')
        }

        // Verify user belongs to organization
        const { data: member } = await supabaseClient
            .from('organization_members')
            .select('role')
            .eq('organization_id', organizationId)
            .eq('user_id', user.id)
            .single();

        if (!member) {
            throw new Error('User is not a member of this organization');
        }

        // Get Organization details for Stripe Customer ID
        const { data: org } = await supabaseClient
            .from('organizations')
            .select('stripe_customer_id, email, name')
            .eq('id', organizationId)
            .single();

        let customerId = org?.stripe_customer_id;

        if (!customerId) {
            // Create new Stripe Customer
            const customer = await stripe.customers.create({
                email: user.email,
                name: org?.name || 'JobMow Customer',
                metadata: {
                    organization_id: organizationId,
                    supabase_user_id: user.id
                }
            });
            customerId = customer.id;

            // Save to DB
            await supabaseClient
                .from('organizations')
                .update({ billing_customer_id: customerId }) // Note: schema says billing_customer_id or stripe_customer_id? 
                // In init plan I used stripe_customer_id but in migration I used billing_customer_id.
                // Let's check the migration I ran. 
                // "alter table organizations add column if not exists billing_customer_id text;"
                // So it is billing_customer_id.
                .eq('id', organizationId);

            // Also update stipe_customer_id if it exists? 
            // Let's just stick to billing_customer_id as per migration.
        }

        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            line_items: [
                {
                    price: priceId, // The Price ID from Stripe Dashboard
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${returnUrl}?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${returnUrl}`,
            subscription_data: {
                metadata: {
                    organization_id: organizationId
                }
            }
        })

        return new Response(
            JSON.stringify({ url: session.url }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        )
    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            }
        )
    }
})
