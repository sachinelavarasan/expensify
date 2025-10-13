const isEmail = (email: string | undefined) =>
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(email ? email : '');

const phoneValidation = new RegExp(/^\d{10}$/);
const otpValidation = (otp: string) => new RegExp(/^\d{6}$/).test(otp);
const pincodeValidation = new RegExp(/^\d{6}$/);
const passwordValidation = (password: string) =>
  /^[\s\S]{8,16}$/.test(password);


export { isEmail, phoneValidation, otpValidation, pincodeValidation, passwordValidation };
