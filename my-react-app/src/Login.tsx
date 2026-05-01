import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Container from "react-bootstrap/Container";
import Header from "./Header";
import Footer from "./Footer";
import { FcGoogle } from "react-icons/fc";

function Login(){
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
            style={{
              backgroundColor: "#FFB090",
              padding: "24px",
              borderRadius: "12px",
            }}
          >
            <h1 style={{textAlign: "center", marginBottom: "20px"}}>Login</h1>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Email address</Form.Label>
              <Form.Control type="email" placeholder="Enter email" />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" placeholder="Password" />
            </Form.Group>

            <Button variant="primary" style={{width: "40%", marginTop: "100px", backgroundColor: "#FFE5B4", borderColor: "#FFE5B4", color: "black"}} type="submit">
              Login
            </Button>
            <Button style={{marginTop: "100px", marginLeft: "10px", backgroundColor: "#FFE5B4", borderColor: "#FFE5B4", color: "black"}}>
              <FcGoogle style={{ marginRight: "8px" }} />
              Sign In Using Google
            </Button>
          </Form>
        </Container>
      </main>

      <Footer />
    </div>
  );
}

export default Login;
