import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';

function Footer() {
  return (
    <Navbar collapseOnSelect expand="lg" style={{ backgroundColor: "#FFB090" }}>
      <Container>
        <Navbar.Brand href="#home" style={{width: "100%", textAlign: "center"}}>Copyright @{new Date().getFullYear()}</Navbar.Brand>
      </Container>
    </Navbar>
  );
}

export default Footer;
