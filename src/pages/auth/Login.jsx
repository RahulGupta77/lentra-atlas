import { useEffect, useRef, useState } from "react";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { loginUserInServer } from "../../services/loginservice.js";
import "./Login.scss";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const usernameRef = useRef(null);
  const passwordRef = useRef(null);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // if (localStorage.getItem("access_token")) {
    //   navigate("/dashboard", { replace: true });
    // }
    setIsLoading(true);
  }, [navigate]);

  const handleUserCredentialsSubmit = async (e) => {
    e.preventDefault();
    const username = usernameRef.current.value.trim();
    const password = passwordRef.current.value.trim();

    // Check if any field is empty
    if (!username || !password) {
      toast.error("All Fields are required!!");
      return;
    }

    // Check if username is a valid 10-digit number
    const isValidPhone = /^\d{10}$/.test(username);
    if (!isValidPhone) {
      toast.error("Please enter a valid 10-digit phone number.");
      return;
    }

    setLoading(true);
    try {
      const response = await loginUserInServer(username, password);

      if (response.status === 401) {
        const message = response?.response?.data?.error;
        toast.error(message || "Phone Number is not Authorized");
        setLoading(false);
        return;
      }

      // if (response.status !== 201) {
      //   throw new Error("Error while login!!");
      // }

      localStorage.setItem("access_token", response.data.access_token);
      usernameRef.current.value = "";
      passwordRef.current.value = "";
      setLoading(false);
      navigate("/dashboard");
      toast.success("Sign-in successful!");
    } catch (error) {
      toast.error(error?.response?.data?.msg || "Something went wrong!");
      setLoading(false);
    }
  };

  const handleNextInputFocus = (e, nextInputName) => {
    if (e?.key === "Enter") {
      e.preventDefault();
      if (nextInputName) {
        const nextInput = document.querySelector(
          `input[name="${nextInputName}"]`
        );
        if (nextInput) {
          nextInput.focus();
        }
      } else {
        handleUserCredentialsSubmit(e);
      }
    }
  };

  return (
    <>
      {isLoading && (
        <div className="user-signin">
          <div className="signin-box">
            <h1>User Login</h1>
            {/* <h3>Hey, Enter your details to get sign in to your account</h3> */}
            <form onSubmit={handleUserCredentialsSubmit}>
              <div className="signin-input">
                <label htmlFor="username-input">Phone Number</label>
                <input
                  type="text"
                  id="username-input"
                  name="username-input"
                  placeholder="956XXX69XX"
                  onKeyDown={(e) => handleNextInputFocus(e, "password-input")}
                  ref={usernameRef}
                />
              </div>

              <div className="signin-input">
                <label htmlFor="password-input">OTP</label>
                <div className="password-input">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password-input"
                    name="password-input"
                    placeholder="**************"
                    onKeyDown={() => handleNextInputFocus(null, null)}
                    ref={passwordRef}
                  />
                  <span
                    className="eye-icon"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? <IoMdEyeOff /> : <IoMdEye />}
                  </span>
                </div>
              </div>

              <button type="submit" className="user-signin-btn">
                {loading ? <span className="loading-state"></span> : "Sign In"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Login;
