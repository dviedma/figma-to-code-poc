import figma from "@figma/code-connect";
import Card from "./Card";

// TODO: Card is embedded inside the Feature Cards component in Figma — extract it as a
// standalone Component in Figma, then update the node-id below.
figma.connect(
  Card,
  "https://www.figma.com/design/MYIdf8YbpcuQDJMAacEHCZ?node-id=9-4",
  {
    props: {
      title: figma.string("Title"),
      description: figma.string("Description"),
    },
    example: (props) => (
      <Card
        title={props.title ?? "Feature title"}
        description={props.description ?? "Feature description goes here."}
      />
    ),
  }
);
