import figma from "@figma/code-connect";
import FeatureCards from "./FeatureCards";

figma.connect(
  FeatureCards,
  "https://www.figma.com/design/MYIdf8YbpcuQDJMAacEHCZ?node-id=75-8",
  {
    example: () => <FeatureCards />,
  }
);
