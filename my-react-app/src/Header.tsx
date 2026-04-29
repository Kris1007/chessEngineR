import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';

function Header() {
  return (
    <Navbar collapseOnSelect expand="lg" style={{ backgroundColor: "#FFB090" }}>
      <Container>
        <Navbar.Brand href="#home">Chess Engine R</Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="#features">Home</Nav.Link>
            <Nav.Link href="#pricing">History</Nav.Link>
          </Nav>
          <Nav>
            <Nav.Link href="#deets">Logout</Nav.Link>
            <Nav.Link href="#user">Username</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Header;