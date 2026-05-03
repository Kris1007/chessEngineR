import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Container from "react-bootstrap/Container";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import { loginWithGoogleCredential, loginWithEmail } from "./auth";

function Login() {
  const navigate = useNavigate();
  const [authError, setAuthError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setAuthError("");
    try {
      await loginWithEmail({ email, password });
      navigate("/home");
    } catch (error: any) {
      setAuthError(error.message || "Login failed.");
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
            <h1 style={{ textAlign: "center", marginBottom: "20px" }}>Login</h1>
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
              Login
            </Button>

            <div style={{ display: "flex", justifyContent: "center", marginTop: "16px" }}>
              <GoogleLogin
                onSuccess={async (credentialResponse) => {
                  if (!credentialResponse.credential) {
                    setAuthError("Google did not return a credential.");
                    return;
                  }

                  try {
                    await loginWithGoogleCredential(credentialResponse.credential);
                    navigate("/home");
                  } catch (error: any) {
                    console.error(error);
                    setAuthError(error.message || "Could not sign in with Google.");
                  }
                }}
                onError={() => setAuthError("Google sign-in was cancelled or failed.")}
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

export default Login;
