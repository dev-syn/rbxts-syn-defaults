import { Players } from '@rbxts/services';

const TOOLTIP_ROOT_NAME = "ROOT_TOOLTIP";

function getOrCreateRootUI(): ScreenGui {
	const playerGui = Players.LocalPlayer?.FindFirstAncestorOfClass("PlayerGui");
	if (!playerGui) throw error("Cannot find PlayerGui for the local player.");

	let rootUI = playerGui.FindFirstChild(TOOLTIP_ROOT_NAME) as ScreenGui;

	if (rootUI && rootUI.IsA("ScreenGui")) return rootUI;

	rootUI = new Instance("ScreenGui");
	rootUI.Name = TOOLTIP_ROOT_NAME;

	rootUI.ResetOnSpawn = false;
	rootUI.ZIndexBehavior = Enum.ZIndexBehavior.Global;

	rootUI.Parent = playerGui;

	return rootUI;
}

export const ToolTipRoot = getOrCreateRootUI();
