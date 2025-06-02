import React, { useContext, useRef, useState } from "react";
// import SignImg from "./SignImg.png";
import { TextField } from "@mui/material";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const ResetPassword = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [newPassword, setnewPassword] = useState("");
  const [isEmailSend, setIsEmailSend] = useState(false);
  const [otp, setOtp] = useState(0);
  const [isotpSubmitted, setIsotpSubmitted] = useState(false);

  const { backendUrl, isLoggedin, userData, getUserData } =
    useContext(AppContext);
  const inputRef = useRef([]);

  axios.defaults.withCredentials = true;

  const handleVerification = async (e) => {
    try {
      e.preventDefault();
      const otpArray = inputRef.current.map((e) => e.value);
      setOtp(otpArray.join(""));
      setIsotpSubmitted(true);

      // const { data } = await axios.post(backendUrl + "/api/auth/verify-otp", {
      //   otp,
      // });

      // if (data.success) {
      //   toast.success(data.message);
      //   getUserData();
      //   navigate("/");
      // } else {
      //   toast.error(data.message);
      // }
    } catch (error) {
      toast.error(error.data.message);
    }
  };

  const handleInput = (e, index) => {
    if (e.target.value.length > 0 && index < inputRef.current.length - 1) {
      inputRef.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && index > 0 && e.target.value === "") {
      inputRef.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const data = e.clipboardData.getData("text");
    const values = data.split("");
    values.forEach((value, index) => {
      inputRef.current[index].value = value;
      if (index < inputRef.current.length - 1) {
        inputRef.current[index + 1].focus();
      }
    });
  };

  const handleSignup = () => {};

  const onSubmitEmail = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(
        backendUrl + "/api/auth/send-reset-otp",
        { email }
      );
      data.success ? toast.success(data.message) : toast.error(data.message);
      data.success && setIsEmailSend(true);
    } catch (error) {
      toast.error(error.data.message);
    }
  };

  const onSubmitNewPassword = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(
        backendUrl + "/api/auth/reset-password",
        { email, otp, newPassword, }
      );
      data.success ? toast.success(data.message) : toast.error(data.message);
      data.success && navigate("/login");
    } catch (error) {
      toast.error(error.data.message);
    }
  };

  return (
    <div className="relative flex max-lg:flex-col-reverse justify-center xl:justify-center md:justify-start items-center  gap-12 lg:mt-28 xl:gap-24 ">
      {/* <img src={SignImg} alt="Sign Image" /> */}
      <div className="flex flex-col gap-6 md:gap-8 md:mx-10 items-center sm:items-start max-lg:mt-40 justify-center">
        {/* email verify form */}

        {!isEmailSend && (
          <form
            className="flex flex-col gap-6 w-72 md:w-96"
            onSubmit={onSubmitEmail}
          >
            <h1 className="text-4xl font-medium font-inter ">Reset Password</h1>
            <p>Enter Your Registered Email Address</p>
            <TextField
              label="Email Address"
              variant="standard"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <button className="w-full py-3 bg-cyan-500 rounded-lg text-white">
              Submit
            </button>
          </form>
        )}

        {/*otp enter form*/}

        {!isotpSubmitted && isEmailSend && (
          <form
            className="flex flex-col gap-6 w-72 md:w-96"
            onSubmit={handleVerification}
          >
            <h1 className="text-4xl font-medium font-inter ">
              Reset Password Otp
            </h1>
            <p>Enter the 6-digit code sent to your email</p>

            <div onPaste={handlePaste}>
              {Array(6)
                .fill(0)
                .map((_, index) => (
                  <input
                    type="text"
                    maxLength="1"
                    key={index}
                    required
                    className="w-12 h-12 border border-gray-300 rounded-md text-center text-lg font-semibold focus:outline-none focus:border-blue-500 mr-2"
                    ref={(e) => (inputRef.current[index] = e)}
                    onInput={(e) => handleInput(e, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                  />
                ))}
            </div>
            <button className="w-full py-3 bg-cyan-500 rounded-lg text-white">
              Verify Email
            </button>
          </form>
        )}

        {/*Enter Password */}

        {isotpSubmitted && isEmailSend && (
          <form
            className="flex flex-col gap-6 w-72 md:w-96"
            onSubmit={onSubmitNewPassword}
          >
            <h1 className="text-4xl font-medium font-inter ">New Password</h1>
            <p>Enter the new password</p>
            <TextField
              label="Password"
              variant="standard"
              value={newPassword}
              onChange={(e) => setnewPassword(e.target.value)}
              // type="password"
              required
            />

            <button className="w-full py-3 bg-cyan-500 rounded-lg text-white">
              Submit
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
