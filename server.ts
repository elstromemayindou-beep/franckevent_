import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import Stripe from 'stripe';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let stripe: Stripe | null = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Stripe Endpoint
  app.post('/api/create-checkout-session', async (req, res) => {
    const { bookingId, amount, serviceName, currency = 'XOF' } = req.body;
    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    
    if (stripe) {
      try {
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: [
            {
              price_data: {
                currency: currency.toLowerCase(),
                product_data: {
                  name: `Réservation: ${serviceName}`,
                },
                unit_amount: amount, // Amount in cents or smallest unit
              },
              quantity: 1,
            },
          ],
          mode: 'payment',
          success_url: `${appUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${appUrl}/services`,
          metadata: {
            bookingId: bookingId,
          },
        });

        res.json({ id: session.id, url: session.url });
      } catch (error: any) {
        console.error('Stripe session creation error:', error);
        res.status(500).json({ error: error.message });
      }
    } else {
      // Fallback/Mock logic
      console.log(`Mocking checkout session for booking ${bookingId} and amount ${amount}`);
      res.json({ 
        id: 'mock_session_' + Math.random().toString(36).substring(7),
        url: `${appUrl}/payment-success?session_id=mock`
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
