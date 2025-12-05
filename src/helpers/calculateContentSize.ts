import { TextService } from '@rbxts/services';

interface TextProps {
	text: string;
	fontSize: number;
	font: Font | Enum.Font;
	lineHeight?: number;
}

export function calculateContentSize(props: TextProps,bounds: Vector2) {
	if (!props.font) return new Vector2(0,0);
	return TextService.GetTextSize(
		props.text,
		props.fontSize,
		props.font,
		bounds
	);
}