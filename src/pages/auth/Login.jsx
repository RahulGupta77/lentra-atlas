import { useCallback, useEffect, useRef, useState } from "react";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { loginUserInServer } from "../../services/loginservice.js";
import {
  captureException,
  logger,
  startSpan,
  withTransaction,
} from "../../utils/sentry";
import "./Login.scss";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const usernameRef = useRef(null);
  const passwordRef = useRef(null);
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const checkAuthStatus = () => {
      return withTransaction("Login Page Load", "pageload", () => {
        try {
          const token = localStorage.getItem("access_token");
          if (token) {
            logger.info("User already authenticated, redirecting to dashboard");
            navigate("/dashboard", { replace: true });
            return;
          }

          logger.info("Login page initialized", {
            hasAccessToken: false,
          });
        } catch (error) {
          logger.error("Error checking auth status", { error: error.message });
          captureException(error, {
            location: "Login Page Auth Check",
          });
        }
      });
    };

    checkAuthStatus();
  }, [navigate]);

  // Validation functions
  const validatePhone = (phone) => {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phone);
  };

  const validateForm = (username, password) => {
    const newErrors = {};

    if (!username.trim()) {
      newErrors.username = "Phone number is required";
    } else if (!validatePhone(username)) {
      newErrors.username = "Please enter a valid 10-digit phone number";
    }

    if (!password.trim()) {
      newErrors.password = "OTP is required";
    } else if (password.length < 4) {
      newErrors.password = "OTP must be at least 4 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Sanitize phone number for logging (privacy-safe)
  const sanitizePhone = (phone) => {
    if (!phone || phone.length < 3) return "***";
    return phone.substring(0, 3) + "*".repeat(phone.length - 3);
  };

  const handleInputChange = useCallback(
    (field, value) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));

      // Clear error when user starts typing
      if (errors[field]) {
        setErrors((prev) => ({
          ...prev,
          [field]: "",
        }));
      }
    },
    [errors]
  );

  const handleUserCredentialsSubmit = async (e) => {
    e.preventDefault();

    const username = usernameRef.current?.value?.trim() || "";
    const password = passwordRef.current?.value?.trim() || "";

    // Validate form
    if (!validateForm(username, password)) {
      logger.warn("Login form validation failed", {
        hasUsername: !!username,
        hasPassword: !!password,
        usernameValid: validatePhone(username),
      });
      return;
    }

    setLoading(true);

    return withTransaction("User Login Flow", "auth", async () => {
      try {
        logger.info("Login attempt initiated", {
          username: sanitizePhone(username),
        });

        const response = await startSpan(
          {
            op: "http.client",
            name: "Login API Call",
          },
          async () => {
            return await loginUserInServer(username, password);
          }
        );

        // Handle different response scenarios
        if (response?.status === 401) {
          const errorMessage =
            response?.response?.data?.error || "Phone Number is not Authorized";

          logger.warn("Unauthorized login attempt", {
            error: errorMessage,
            username: sanitizePhone(username),
          });

          toast.error(errorMessage);
          return;
        }

        if (!response?.data?.access_token) {
          throw new Error("Invalid response: Missing access token");
        }

        // Successful login
        localStorage.setItem("access_token", response.data.access_token);

        // Clear form
        if (usernameRef.current) usernameRef.current.value = "";
        if (passwordRef.current) passwordRef.current.value = "";
        setFormData({ username: "", password: "" });
        setErrors({});

        logger.info("User successfully logged in", {
          username: sanitizePhone(username),
        });

        toast.success("Sign-in successful!");
        navigate("/dashboard", { replace: true });
      } catch (error) {
        const errorMessage =
          error?.response?.data?.msg ||
          error?.response?.data?.error ||
          error?.message ||
          "Login failed. Please try again.";

        logger.error("Login failed", {
          error: error?.message,
          status: error?.response?.status,
          username: sanitizePhone(username),
        });

        captureException(error, {
          location: "Login API Call",
          username: sanitizePhone(username),
          responseStatus: error?.response?.status,
          responseData: error?.response?.data,
        });

        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    });
  };

  const handleKeyDown = (e, nextInputRef) => {
    if (e?.key === "Enter") {
      e.preventDefault();
      if (nextInputRef?.current) {
        nextInputRef.current.focus();
      } else {
        handleUserCredentialsSubmit(e);
      }
    }
  };

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  return (
    <div className="user-signin">
      <div className="signin-box">
        <h1>User Login</h1>
        <form onSubmit={handleUserCredentialsSubmit} noValidate>
          <div className="signin-input">
            <label htmlFor="username-input">
              Phone Number <span className="required">*</span>
            </label>
            <input
              type="tel"
              id="username-input"
              name="username"
              placeholder="9567896543"
              maxLength="10"
              onKeyDown={(e) => handleKeyDown(e, passwordRef)}
              onChange={(e) => handleInputChange("username", e.target.value)}
              ref={usernameRef}
              className={errors.username ? "error" : ""}
              disabled={loading}
              autoComplete="tel"
              inputMode="numeric"
            />
            {errors.username && (
              <span className="error-message">{errors.username}</span>
            )}
          </div>

          <div className="signin-input">
            <label htmlFor="password-input">
              OTP <span className="required">*</span>
            </label>
            <div className="password-input">
              <input
                type={showPassword ? "text" : "password"}
                id="password-input"
                name="password"
                placeholder="Enter OTP"
                onKeyDown={(e) => handleKeyDown(e, null)}
                onChange={(e) => handleInputChange("password", e.target.value)}
                ref={passwordRef}
                className={errors.password ? "error" : ""}
                disabled={loading}
                autoComplete="one-time-code"
              />
              <button
                type="button"
                className="eye-icon"
                onClick={togglePasswordVisibility}
                disabled={loading}
                aria-label={showPassword ? "Hide OTP" : "Show OTP"}
              >
                {showPassword ? <IoMdEyeOff /> : <IoMdEye />}
              </button>
            </div>
            {errors.password && (
              <span className="error-message">{errors.password}</span>
            )}
          </div>

          <button type="submit" className="user-signin-btn" disabled={loading}>
            {loading ? (
              <>
                <span className="loading-state"></span>
                Signing In...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
