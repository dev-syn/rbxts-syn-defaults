import React, { useMemo, useRef } from '@rbxts/react';
import { TweenService } from '@rbxts/services';

const DEFAULT_CLOSE: string = "http://www.roblox.com/asset/?id=6031094678";
const DEFAULT_SIZE: UDim2 = new UDim2(0.1,0,0.1,0);
const DEFAULT_BTN_COLOR: Color3 = Color3.fromRGB(215,0,0);
const TWEEN_INFO = new TweenInfo(0.2,Enum.EasingStyle.Quad,Enum.EasingDirection.Out);

interface CloseBtnProps {
	btnContent?: string;
	size?: UDim2;
	btnColor?: Color3;
	bgColor?: Color3;
	onClose: () => void;
}

export function CloseBtn(btnProps: CloseBtnProps) {

	const btnContent = btnProps.btnContent ?? DEFAULT_CLOSE;
	const btnSize = btnProps.size ?? DEFAULT_SIZE;
	const btnColor = btnProps.btnColor ?? DEFAULT_BTN_COLOR;
	const bgColor = btnProps.bgColor ?? new Color3(1,1,1);

	const containerRef = useRef<Frame>();
	const shaderRef = useRef<Frame>();
	const btnRef = useRef<ImageButton>();

	// Calculate contrast
	const shaderColor = useMemo(() => {
		const lum = bgColor.R * 0.299 + bgColor.G * 0.587 + bgColor.B * 0.114;
		return lum > 0.5 ? new Color3(0,0,0) : new Color3(1,1,1);
	},[bgColor]);

	const setShaderOpacity = (transparency: number) => {
		if (shaderRef.current) TweenService.Create(shaderRef.current,TWEEN_INFO,{ BackgroundTransparency: transparency }).Play();
	};

	return (
		// Container Frame
		<frame
			key={"CloseBtnContainer"}
			ref={containerRef}

			Size={btnSize}
			BackgroundTransparency={1}
			ClipsDescendants={true}
			BorderSizePixel={0}
		>
			<uiaspectratioconstraint
				key={"UIAspectRatioConstraint"}

				AspectRatio={1}
				AspectType={Enum.AspectType.FitWithinMaxSize}
				DominantAxis={Enum.DominantAxis.Height}
			/>

			<frame
				key={"Shader"}
				ref={shaderRef}

				ZIndex={2}
				Size={UDim2.fromScale(1,1)}
				BackgroundColor3={shaderColor}
				BackgroundTransparency={1}
				BorderSizePixel={0}
				Active={false}
			/>

			<imagebutton
				key={"CloseBtn"}
				ref={btnRef}

				ZIndex={1}
				Size={UDim2.fromScale(1,1)}
				Image={btnContent}
				ImageColor3={btnColor}
				ScaleType={Enum.ScaleType.Fit}
				AutoButtonColor={false}
				Event={{
					Activated: () => {
						// Hide the CloseBtn
						if (containerRef.current) containerRef.current.Visible = false;
						btnProps.onClose();
					},
					MouseEnter: () => setShaderOpacity(0.85),
					MouseLeave: () => setShaderOpacity(1),
					MouseButton1Down: () => setShaderOpacity(0.7),
					MouseButton1Up: () => setShaderOpacity(0.85)
				}}
			>
			</imagebutton>
		</frame>
	);
};