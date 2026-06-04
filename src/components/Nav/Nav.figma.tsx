import figma from "@figma/code-connect";
import Nav from "./Nav";

figma.connect(
  Nav,
  "https://www.figma.com/design/MYIdf8YbpcuQDJMAacEHCZ?node-id=75-2",
  {
    example: () => <Nav />,
  }
);
