import figma from "@figma/code-connect";
import Footer from "./Footer";

figma.connect(
  Footer,
  "https://www.figma.com/design/MYIdf8YbpcuQDJMAacEHCZ?node-id=75-10",
  {
    example: () => <Footer />,
  }
);
