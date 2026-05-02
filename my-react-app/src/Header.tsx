import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { getStoredUser } from './auth';

function Header() {
  const user = getStoredUser();

  return (
    <Navbar collapseOnSelect expand="lg" style={{ backgroundColor: "#FFB090" }}>
      <Container>
        <Navbar.Brand href={user ? "/home" : "/login"}>Chess Engine R</Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          {user ? (
            <>
              <Nav className="me-auto">
                <Nav.Link href="/home">Home</Nav.Link>
                <Nav.Link href="/history">History</Nav.Link>
              </Nav>
              <Nav>
                <Nav.Link href="/user/logout">Logout</Nav.Link>
                <Nav.Link>{user.name ?? "Username"}</Nav.Link>
              </Nav>
            </>
          ) : (
            <>
              <Nav className="me-auto"></Nav>
              <Nav>
                <Nav.Link href="/login">Login</Nav.Link>
                <Nav.Link href="/signup">Sign Up</Nav.Link>
              </Nav>
            </>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Header;
