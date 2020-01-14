import axios from 'axios';
import { showAlert } from './alerts';

// "Type" is either password or 'data'
export const updateSettings = async (data, type) => {
  try {
    const url =
      type === 'password'
        ? // Dev url
          // ? 'http://127.0.0.1:3210/api/v1/users/updateMyPassword'
          // : 'http://127.0.0.1:3210/api/v1/users/updateMe';
          '/api/v1/users/updateMyPassword'
        : '/api/v1/users/updateMe';

    const res = await axios({
      method: 'PATCH',
      url,
      data
    });
    if (res.data.status === 'success') {
      showAlert('success', `${type.toUpperCase()} updated successfully!`);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
