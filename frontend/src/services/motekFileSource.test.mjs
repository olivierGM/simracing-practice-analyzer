/**
 * Tests unitaires : MotekFileSource (Story 3)
 */
import { describe, it, expect } from 'vitest';
import { motekFileSource, parseLdxXml } from './motekFileSource.js';

describe('parseLdxXml', () => {
  it('parse un XML valide avec des Marker', () => {
    const xml = `<?xml version="1.0"?>
<LDXFile Version="1.6">
  <Layers><Layer><MarkerBlock>
    <MarkerGroup Name="Beacons">
      <Marker Time="2.0" Type="brake" Percent="80" Duration="1.0"/>
      <Marker Time="4.0" Type="wheel" Angle="45" Duration="1.5"/>
    </MarkerGroup>
  </MarkerBlock></Layer></Layers>
</LDXFile>`;
    const result = parseLdxXml(xml, 'test-circuit.ldx');
    expect(result.targets).toHaveLength(2);
    expect(result.targets[0]).toMatchObject({ type: 'brake', time: 2, percent: 80, duration: 1 });
    expect(result.targets[1]).toMatchObject({ type: 'wheel', time: 4, angle: 45, duration: 1.5 });
    expect(result.name).toBe('test-circuit');
    expect(result.mapName).toBe('test');
  });

  it('retourne targets vides si pas de Marker', () => {
    const xml = `<?xml version="1.0"?>
<LDXFile Version="1.6">
  <Layers><Layer><MarkerBlock>
    <MarkerGroup Name="Beacons"></MarkerGroup>
  </MarkerBlock></Layer></Layers>
</LDXFile>`;
    const result = parseLdxXml(xml, 'empty.ldx');
    expect(result.targets).toHaveLength(0);
  });
});

describe('motekFileSource.load', () => {
  it('charge un fichier .ldx via File-like', async () => {
    const xml = `<?xml version="1.0"?><LDXFile><Layers><Layer><MarkerBlock><MarkerGroup><Marker Time="2" Type="brake" Percent="80" Duration="1"/></MarkerGroup></MarkerBlock></Layer></Layers></LDXFile>`;
    const file = { name: 'circuit.ldx', text: () => Promise.resolve(xml) };
    const result = await motekFileSource.load(file);
    expect(result.targets).toHaveLength(1);
    expect(result.targets[0]).toMatchObject({ type: 'brake', time: 2 });
  });

  it('accepte .ldx sans Marker → fallback random (fichiers sample type Barcelona)', async () => {
    const xml = `<?xml version="1.0"?><LDXFile><Layers><Layer><MarkerBlock><MarkerGroup></MarkerGroup></MarkerBlock></Layer></Layers></LDXFile>`;
    const file = { name: 'Barcelona-bmw_m4_gt3-3-2024.06.12-18.40.53.ldx', text: () => Promise.resolve(xml) };
    const result = await motekFileSource.load(file);
    expect(result.type).toBe('random');
    expect(result.mapName).toBe('Barcelona');
    expect(result.name).toContain('Barcelona');
    expect(result.duration).toBe(102);
  });

  it('rejette un fichier non .ld/.ldx', async () => {
    const file = new File(['content'], 'test.txt', { type: 'text/plain' });
    await expect(motekFileSource.load(file)).rejects.toThrow(/Format non supporté/);
  });

  it('rejette un input non-File', async () => {
    await expect(motekFileSource.load('not a file')).rejects.toThrow(/objet File/);
  });
});
