const Payment = require('../models/Payment');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const httpStatus = require('../utils/httpStatus');

const createCustomer = async (req, res) => {
    try {
      const { email, name, course_id } = req.body;
      console.log('Received email:', email); // Log the received email
      console.log('Received name:', name);   // Log the received name
      console.log('Received course_id:', course_id);

      const newCustomer = new Payment({
        email,
        name,
        course_id,
      });

      const savedCustomer = await newCustomer.save();
      res.status(httpStatus.CREATED).json(savedCustomer);
    } catch (error) {
      console.error('Error creating customer:', error.stack);
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        status: 'error',
        statusCode: httpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
      });
    }
};


const createCheckoutSession = async (req, res) => {
  try {
    const { productName, price, successUrl, failUrl, quantity, email, name,course_id } = req.body;

    const paymentData = {
      productName: productName,
      price: parseInt(price) / 100,
      status: "processing",
      email: email,
      name: name,
      course_id:course_id,
    };

    const payment = await Payment.create(paymentData);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'hkd',
          product_data: {
            name: productName,
          },
          unit_amount: price,
        },
        quantity: quantity,
      }],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: failUrl,
      metadata: {  // adding metadata here
        price: String(price),
        productName: productName,
        bookingid: payment.id,
        email: email,
        name: name,
        course_id:course_id,
      }
    });

    res.json({ id: session.id });
  } catch (error) {
    res.status(500).send({ error: error.message });
    console.error(error);
  }
};

const handleSessionDetails = async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(req.query.sessionId);

    if (!session.metadata || !session.metadata.bookingid) {
      return res.status(404).json({ error: 'Metadata not found or booking ID missing' });
    }

    let payment = await Payment.findById(session.metadata.bookingid);

    let attempts = 0;
    const maxAttempts = 10;

    while (payment.status === 'processing' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 3000)); // Wait for 3 seconds
      payment = await Payment.findById(session.metadata.bookingid); // Refresh the payment status
      attempts++;
    }

    if (payment.status === 'processing') {
      return res.status(408).json({ error: 'Payment processing took too long.' });
    }

    res.json({
      session,
      paymentStatus: payment.status
    });

  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve session details' });
  }
};

const handleStripeWebhook = async (req, res) => {
  const incomingEvent = req.body;

  try {
    const eventFromStripe = await stripe.events.retrieve(incomingEvent.id);

    if (eventFromStripe.type === 'checkout.session.completed') {
      const session = eventFromStripe.data.object;

      if (!session?.metadata?.bookingid) {
        console.error('Booking ID missing in Stripe event.');
        return res.status(400).send('Booking ID missing in Stripe event.');
      }

      const payment = await Payment.findById(session.metadata.bookingid);

      if (!payment) {
        return res.status(404).send('Payment not found.');
      }

      if (payment.status != 'processing') {
        return res.status(400).send('Payment has already been handled.');
      }

      Object.assign(payment, {
        status: 'success',
        paymentid: session.payment_intent,
      });
      await payment.save();
      res.sendStatus(200);
    } else {
      res.sendStatus(400);
    }
  } catch (error) {
    console.error('Error handling Stripe webhook:', error);
    res.status(500).send('Internal Server Error.');
  }
};


/*const fetchPaidProducts = async (req, res) => {
    try {
      const userEmail = req.user.email; // Ensure req.user is not undefined
      if (!userEmail) {
        throw new Error('User email is not defined');
      }
      const payments = await Payment.find({
        email: userEmail,
        status: 'success'
      });
  
      res.status(200).json(payments);
    } catch (error) {
      console.error('Error fetching paid products:', error.stack);
      res.status(500).json({
        status: 'error',
        message: error.message,
      });
    }
  };
  */

 /* const fetchAllPayments = async (req, res) => {
    try {
      const payments = await Payment.find({ status: 'success' })
        .populate({
          path: 'course_id',
          select: 'photos title'
        });
  
      // Log the populated payments to verify if the photos are being populated
      console.log('Payments with populated course data:', JSON.stringify(payments, null, 2));
      res.status(200).json(payments);
    } catch (error) {
      console.error('Error fetching payments:', error.stack);
      res.status(500).json({
        status: 'error',
        message: error.message,
      });
    }
  };
  
  */
  
  const fetchUserPayments = async (req, res) => {
    const userEmail = req.query.email; // Get the user email from query parameters
  
    try {
      const payments = await Payment.find({ email: userEmail, status: 'success' })
        .populate({
          path: 'course_id',
          select: 'photos title'
        });
  
      // Log the filtered payments
      console.log('Filtered Payments with populated course data:', JSON.stringify(payments, null, 2));
      res.status(200).json(payments);
    } catch (error) {
      console.error('Error fetching payments:', error.stack);
      res.status(500).json({
        status: 'error',
        message: error.message,
      });
    }
  };
  

  
module.exports = {
  createCustomer,
  createCheckoutSession,
  handleSessionDetails,
  handleStripeWebhook,
  fetchUserPayments,
  //fetchPaidProducts,
  //fetchAllPayments,
};
