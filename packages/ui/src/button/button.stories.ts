import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { Button } from "@/src/button/button";

const meta = {
  title: "Button",
  component: Button,
  argTypes: {
    variant: {
      description: "The variant of the button",
      control: { type: "select" },
      options: [
        "default",
        "destructive",
        "outline",
        "secondary",
        "ghost",
        "link",
      ],
      table: { defaultValue: { summary: "default" } },
    },
    size: {
      description: "The size of the button",
      control: { type: "select" },
      options: ["default", "sm", "lg", "icon"],
      table: { defaultValue: { summary: "default" } },
    },
    children: {
      description: "The content of the button",
      control: { type: "text" },
    },
  },
  args: {
    onClick: fn(),
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: "Button" },
};
