import { Players } from '@rbxts/services';

const player = Players.LocalPlayer;

function getPlayerGui(): Promise<PlayerGui> {
	return Promise.try<PlayerGui>(
		() => player.WaitForChild("PlayerGui") as PlayerGui
	);
}

export { getPlayerGui };