// import React, { useContext, useEffect, useRef, useState } from 'react';
// // import SignImg from "./SignImg.png";
// import { TextField } from '@mui/material';
// import { AppContext } from '../context/AppContext';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';
// import { toast } from 'react-toastify';



// const EmailVerify = () => {

// const navigate = useNavigate();

  
// axios.defaults.withCredentials = true;

// const { backendUrl, isLoggedin, userData, getUserData} = useContext(AppContext);
  
// const inputRef = useRef([]);

// const handleVerification = async (e) => {
// try{
//   e.preventDefault();
//   const otpArray = inputRef.current.map(e => e.value);
//   const otp=otpArray.join(''); 
//   const { data } = await axios.post(backendUrl + '/api/auth/verify-otp', {otp});

//   if(data.success){
//     toast.success(data.message);
//     getUserData();
//     navigate('/');
//   }else{
//     toast.error(data.message);
//   }

// }
// catch (error) {
//   toast.error(error?.response?.data?.message || error.message || "Verification failed");
// }
// }

// const handleInput = (e, index) => {
//   if (e.target.value.length > 0 && index < inputRef.current.length - 1) {
//     inputRef.current[index + 1].focus();
//   }
// };

// const handleKeyDown = (e, index) => {
//   if (e.key === 'Backspace' && index > 0 && e.target.value === '') { 
//     inputRef.current[index - 1].focus();
//   }
// }

// const handlePaste = (e) => {
//   e.preventDefault();
//   const data = e.clipboardData.getData('text');
//   const values = data.split('');
//   values.forEach((value, index) => {
//     inputRef.current[index].value = value;
//     if (index < inputRef.current.length - 1) {
//       inputRef.current[index + 1].focus();
//     }
//   });
// }; 

// // useEffect(() => {
// //   isLoggedin && userData && userData.isAccountVerified && navigate('/')
// // },[isLoggedin,userData])


// useEffect(() => {
//   if (isLoggedin && userData && userData.isAccountVerified === true) {
//     navigate('/');
//   }
// }, [isLoggedin, userData, navigate]);

//   return (
//     <div className="relative flex max-lg:flex-col-reverse justify-center xl:justify-center md:justify-start items-center  gap-12 lg:mt-28 xl:gap-24 ">
//     {/* <img src={SignImg} alt="Sign Image" /> */}
//     <div className="flex flex-col gap-6 md:gap-8 md:mx-10 items-center sm:items-start max-lg:mt-40 justify-center">
      

    
//       <form
//         className="flex flex-col gap-6 w-72 md:w-96"
//         onSubmit={handleVerification}
//       >

// <h1 className="text-4xl font-medium font-inter ">
//         Verify Email
//       </h1>
//       <p>
//         Enter the 6-digit code sent to your email
//       </p>

//         <div onPaste={handlePaste}>
//           {Array(6).fill(0).map((_, index) => (
//             <input type='text' maxLength='1' key={index} required className='w-12 h-12 border border-gray-300 rounded-md text-center text-lg font-semibold focus:outline-none focus:border-blue-500 mr-2' 
//             ref = {e => inputRef.current[index] = e}
//             onInput={(e) => handleInput(e,index)}
//             onKeyDown={(e) => handleKeyDown(e,index)}
//             />
//           ))}
//         </div>
//        <button className='w-full text-black py-3 hover:bg-black  hover:text-white border-2 border-black'>Verify Email</button>
//         </form>
//         </div>
        

//     </div>
//   )
// }

// export default EmailVerify;



import React, { useContext, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AppContext } from '../context/AppContext';

const EmailVerify = () => {
  const navigate = useNavigate();
  const { backendUrl, isLoggedin, userData, getUserData } = useContext(AppContext);
  const inputRef = useRef([]);
  const [submitting, setSubmitting] = useState(false);

  axios.defaults.withCredentials = true; // ideally set this once globally

  const handleVerification = async (e) => {
    e.preventDefault();

    const otpArray = inputRef.current.map((el) => el?.value || '');
    const otp = otpArray.join('');
    if (otp.length !== 6) {
      toast.error("Please enter the 6-digit code.");
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await axios.post(`${backendUrl}/api/auth/verify-otp`, { otp });
      if (data?.success) {
        toast.success(data.message || "Email verified successfully!");
        await getUserData(); // refresh user data (sets isAccountVerified: true)
        navigate('/');
      } else {
        toast.error(data?.message || "Verification failed");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || "Verification failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleInput = (e, index) => {
    if (e.target.value.length > 0 && index < inputRef.current.length - 1) {
      inputRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && index > 0 && e.target.value === '') {
      inputRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const data = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    for (let i = 0; i < 6; i++) {
      if (!inputRef.current[i]) continue;
      inputRef.current[i].value = data[i] || '';
    }
    // focus last filled or next input
    const next = Math.min(data.length, 5);
    inputRef.current[next]?.focus();
  };

  // If already verified, redirect home
  useEffect(() => {
    if (isLoggedin && userData && userData.isAccountVerified === true) {
      navigate('/');
    }
  }, [isLoggedin, userData, navigate]);

  return (
    <div className="relative flex max-lg:flex-col-reverse justify-center items-center gap-12 lg:mt-28 xl:gap-24">
      <div className="flex flex-col gap-6 md:gap-8 md:mx-10 items-center sm:items-start max-lg:mt-40 justify-center">
        <form className="flex flex-col gap-6 w-72 md:w-96" onSubmit={submitting ? (e)=>e.preventDefault() : handleVerification}>
          <h1 className="text-4xl font-medium font-inter">Verify Email</h1>
          <p>Enter the 6-digit code sent to your email</p>

          <div onPaste={handlePaste}>
            {Array.from({ length: 6 }).map((_, index) => (
              <input
                key={index}
                type="text"
                inputMode="numeric"
                maxLength="1"
                required
                className="w-12 h-12 border border-gray-300 rounded-md text-center text-lg font-semibold focus:outline-none focus:border-blue-500 mr-2"
                ref={(el) => (inputRef.current[index] = el)}
                onInput={(e) => handleInput(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
              />
            ))}
          </div>

          <button
            className="w-full text-black py-3 hover:bg-black hover:text-white border-2 border-black disabled:opacity-60"
            disabled={submitting}
            type="submit"
          >
            {submitting ? "Verifying..." : "Verify Email"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EmailVerify;
