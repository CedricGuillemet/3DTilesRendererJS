import { FadeMaterialManager, getDitheredTileFadeMaterialPlugin } from '../../src/babylonjs/plugins/fade/FadeMaterialManager.js';
import { TilesFadePlugin } from '../../src/babylonjs/plugins/fade/TilesFadePlugin.js';

function makeTiles() {

	return {
		scene: { activeCamera: null },
		visibleTiles: new Set(),
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
		dispatchEvent: vi.fn(),
		invokeOnePlugin: vi.fn(),
		markTileUsed: vi.fn(),
		traverse: vi.fn(),
	};

}

describe( 'Babylon.js TilesFadePlugin', () => {

	it( 'detects the complete material plugin API', () => {

		class CompletePlugin {

			static GetOrCreate() {}
			getFadeBoundsToRef() {}
			setFadeBounds() {}
			resetFade() {}

		}

		expect( getDitheredTileFadeMaterialPlugin( {} ) ).toBeNull();
		expect( getDitheredTileFadeMaterialPlugin( {
			DitheredTileFadeMaterialPlugin: CompletePlugin,
		} ) ).toBe( CompletePlugin );

	} );

	it( 'falls through without registering a lifecycle when fading is unavailable', () => {

		const tiles = makeTiles();
		const plugin = new TilesFadePlugin();
		plugin._fadeMaterialManager = new FadeMaterialManager( null );
		const warning = vi.spyOn( console, 'warn' ).mockImplementation( () => {} );

		plugin.init( tiles );
		plugin.init( tiles );

		expect( warning ).toHaveBeenCalledTimes( 1 );
		expect( warning ).toHaveBeenCalledWith( expect.stringContaining( 'Tiles will render normally without fading' ) );
		expect( tiles.addEventListener ).not.toHaveBeenCalled();
		expect( plugin.tiles ).toBeNull();
		expect( plugin.setTileVisible( {}, true ) ).toBe( false );
		expect( () => plugin.dispose() ).not.toThrow();
		expect( () => plugin.dispose() ).not.toThrow();
		expect( tiles.removeEventListener ).not.toHaveBeenCalled();

		warning.mockRestore();

	} );

	it( 'registers and disposes the base lifecycle when fading is available', () => {

		const tiles = makeTiles();
		const plugin = new TilesFadePlugin();

		expect( plugin._fadeMaterialManager.supported ).toBe( true );
		expect( () => new TilesFadePlugin().dispose() ).not.toThrow();

		plugin.init( tiles );

		expect( plugin.tiles ).toBe( tiles );
		expect( tiles.addEventListener ).toHaveBeenCalledTimes( 4 );
		expect( plugin.setTileVisible( { traversal: { wasSetActive: true, wasInFrustum: false } }, true ) ).toBe( false );

		plugin.dispose();

		expect( tiles.removeEventListener ).toHaveBeenCalledTimes( 4 );
		expect( plugin.tiles ).toBeNull();
		expect( plugin.setTileVisible( {}, true ) ).toBe( false );
		expect( () => plugin.dispose() ).not.toThrow();

	} );

} );
