import { useContext, useState } from "react";
import Title from "../components/Title";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AppContext } from "../context/AppContext";

function Login() {
  const [currentState, setCurrentState] = useState("SIGN IN");
  const titleValue = currentState.split(" ");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();


  const { backendUrl, isLoggedin, setisLoggedin, getUserData } = useContext(AppContext);



  const handleLogIn = async (e) => {
    try {
      e.preventDefault();
  
      const { data } = await axios.post(
        backendUrl + '/api/auth/login',
        { email, password },
        {
          withCredentials: true, // Ensure credentials (cookies) are included
        }
      );
  
      if (data.success) {
        setisLoggedin(true);
        getUserData();
        navigate('/');
        toast.success(data.message);

      } else {
        toast.error("something went wrong"); // Use toast.error for error messages
      }
    } catch (error) {
      // Check if the error is from the backend and contains a response message
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message); // Display the backend message
      } else {
        toast.error("An error occurred. Please try again."); // Fallback error message
      }
    }
  }

  return (
    <form
      onSubmit={handleLogIn}
      className="flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800 "
    >
      <div className="mb-4 text-4xl sm:text-5xl">
        <Title text1={"SIGN"} text2={"IN"} />
        
      </div>
      {/* {currentState === "SIGN IN" ? (
        ""
      ) : (
        <input
          type="text"
          className="w-full px-3 py-2 border border-gray-800 outline-none"
          placeholder="Name"
          required
        />
      )} */}
      <input
        type="email"
        className="w-full px-3 py-2 border border-gray-800 outline-none"
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        className="w-full px-3 py-2 border border-gray-800 outline-none"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <div className="flex justify-between w-full text-sm mt-[-8px]">
        <p className="border-b border-white cursor-pointer hover:border-black " onClick={() => navigate("/reset-password")}>
          Forgot Your Password?
        </p>
     
          <p
            onClick={() => navigate("/signup")}
            className="border-b border-white cursor-pointer hover:border-black "
          >
            Don&apos;t have an account? Sign Up.
          </p>
      
      </div>
      <button type="submit" className="w-full py-3 mt-6 font-light text-white bg-black">
        Sign in
      </button>
    </form>
  );
}

export default Login;
