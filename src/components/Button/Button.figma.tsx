import figma from "@figma/code-connect";
import Button from "./Button";

// TODO: Button is embedded inside section components in Figma — extract it as a
// standalone Component in Figma, then update the node-id below.
figma.connect(
  Button,
  "https://www.figma.com/design/MYIdf8YbpcuQDJMAacEHCZ?node-id=6-3",
  {
    props: {
      label: figma.string("Label"),
      size: figma.enum("Size", { sm: "sm", lg: "lg" }),
    },
    example: (props) => <Button label={props.label ?? "Get Started"} size={props.size ?? "sm"} />,
  }
);
