import axios from 'axios';
import { showAlert } from './alerts';

const stripe = Stripe('pk_test_7kIfrMr48m4E45AnXSpYXFeO00aiSUQbnV');

export const bookEvent = async placeId => {
  try {
    // 1) Get checkout session from API
    const session = await axios(
      // Dev url
      // `http://127.0.0.1:3210/api/v1/bookings/checkout-session/${placeId}`
      `/api/v1/bookings/checkout-session/${placeId}`
    );
    // console.log(session);

    // 2) Create checkout form + charge the credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
