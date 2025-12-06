import { TextService } from '@rbxts/services';

export interface CalculateContentProps {
	text: string;
	textSize: number;
	font: Font | Enum.Font;
	richText?: boolean;
}

export function isFontObject(val: unknown): val is Font {
	return typeIs(val,"Font");
}

/** Calculates how much a font with a size would take up.
 * You can provide a Enum.Font or a Font object itself.
 * NOTE: When providing a Font object this method can yield especially when the Font is not already loaded.
 */
export function calculateContentSize(props: CalculateContentProps,bounds: Vector2): Vector2 {
	if (!props.font) return new Vector2(0,0);

	if (isFontObject(props.font)) {
		// We know it's a Font object
		const textBoundParams: GetTextBoundsParams = new Instance("GetTextBoundsParams");
		textBoundParams.Font = props.font;
		textBoundParams.RichText = !!props.richText;
		textBoundParams.Size = props.textSize;
		textBoundParams.Text = props.text;
		textBoundParams.Width = bounds.X;

		const [success,sizeOrErr] = pcall(() => {
			TextService.GetTextBoundsAsync(textBoundParams);
		});
		if (success) return sizeOrErr as unknown as Vector2;
		else {
			warn(`calculateContentSize failed for Font object: ${sizeOrErr}`);
			return new Vector2(0,0);
		}
	} else {
		// Let's assume a Enum.Font
		return TextService.GetTextSize(
			props.text,
			props.textSize,
			props.font,
			bounds
		);
	}
}