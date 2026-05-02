import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Container from "react-bootstrap/Container";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import { loginWithGoogleCredential, signupWithEmail } from "./auth";

function Signup() {
  const navigate = useNavigate();
  const [authError, setAuthError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setAuthError("");

    if (password !== confirmPassword) {
      setAuthError("Passwords do not match.");
      return;
    }

    try {
      await signupWithEmail({ email, password });
      navigate("/home");
    } catch (error: any) {
      setAuthError(error.message || "Signup failed.");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#FFE5B4",
      }}
    >
      <Header />

      <main
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Container style={{ maxWidth: "420px" }}>
          <Form
            onSubmit={handleSubmit}
            style={{
              backgroundColor: "#FFB090",
              padding: "24px",
              borderRadius: "12px",
            }}
          >
            <h1 style={{ textAlign: "center", marginBottom: "20px" }}>Sign Up</h1>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Email address</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicConfirmPassword">
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </Form.Group>

            <Button
              variant="primary"
              style={{
                width: "100%",
                marginTop: "24px",
                backgroundColor: "#FFE5B4",
                borderColor: "#FFE5B4",
                color: "black",
              }}
              type="submit"
            >
              Register
            </Button>

            <div style={{ display: "flex", justifyContent: "center", marginTop: "16px" }}>
              <GoogleLogin
                text="signup_with"
                onSuccess={async (credentialResponse) => {
                  if (!credentialResponse.credential) {
                    setAuthError("Google did not return a credential.");
                    return;
                  }

                  try {
                    await loginWithGoogleCredential(credentialResponse.credential);
                    navigate("/home");
                  } catch (error) {
                    console.error(error);
                    setAuthError("Could not sign up with Google.");
                  }
                }}
                onError={() => setAuthError("Google sign-up was cancelled or failed.")}
              />
            </div>

            {authError && (
              <div style={{ marginTop: "12px", color: "#8A1F11", textAlign: "center" }}>
                {authError}
              </div>
            )}
          </Form>
        </Container>
      </main>

      <Footer />
    </div>
  );
}

export default Signup;
