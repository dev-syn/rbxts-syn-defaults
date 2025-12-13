declare global {
	interface CoreGui extends GuiBase2d {
		readonly Archivable: boolean;
		SetState(name: string,value: unknown): void;
	}
}

export {};