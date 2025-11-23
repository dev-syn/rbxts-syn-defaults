import React, { useRef } from '@rbxts/react';

const DEFAULT_CLOSE: string = "http://www.roblox.com/asset/?id=6031094678";
const DEFAULT_SIZE: UDim2 = new UDim2(0.1,0,0.1,0);
const DEFAULT_TINT_COLOR: Color3 = Color3.fromRGB(255,0,0);

interface CloseBtnProps {
	btnContent?: string;
	size?: UDim2;
	tintColor?: Color3;
	onClick: () => void;
}

export function CloseBtn(btnProps: CloseBtnProps) {
	const btnContent = btnProps.btnContent ?? DEFAULT_CLOSE;
	const btnSize = btnProps.size ?? DEFAULT_SIZE;
	const tintColor = btnProps.tintColor ?? DEFAULT_TINT_COLOR;

	const btnRef = useRef<ImageButton>();
	return (
		<imagebutton
			key={"CloseBtn"}
			ref={btnRef}
			Image={btnContent}
			ScaleType={Enum.ScaleType.Fit}
			Size={btnSize}
			AnchorPoint={new Vector2(1,0)}
			Position={new UDim2(1,0,0,0)}
			BackgroundTransparency={1}
			AutoButtonColor={false}
			Event={{
				MouseButton1Click: () => {
					if (btnRef.current) {
						const parentInst = btnRef.current.Parent;

						if (parentInst && parentInst.IsA("GuiObject")) {
							parentInst.Visible = false;
						}

						// Close the parent Instance of the close button
						btnProps.onClick();
					}
				}
			}}
		>
			<uiaspectratioconstraint
				AspectType={Enum.AspectType.FitWithinMaxSize}
				DominantAxis={Enum.DominantAxis.Height}
				AspectRatio={1}
			/>
		</imagebutton>
	);
}