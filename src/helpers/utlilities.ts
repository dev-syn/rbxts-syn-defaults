import { GuiService, Workspace } from '@rbxts/services';

function getViewportSize(): Vector2 {
	return Workspace.CurrentCamera ? Workspace.CurrentCamera.ViewportSize : Vector2.zero;
}

function getGuiInset(): {topLeft: Vector2,botRight: Vector2} {
	const [topLeft,botRight] = GuiService.GetGuiInset();
	return { topLeft, botRight };
}
 
function getSafeZoneSize(): Vector2 {
	const viewportSize = getViewportSize();

	const [topLeft,_] = GuiService.GetGuiInset();
	return viewportSize.sub(topLeft);
}

export { getViewportSize,getGuiInset,getSafeZoneSize };