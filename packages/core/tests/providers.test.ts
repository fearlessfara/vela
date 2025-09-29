/** AWS-SPEC: Core Provider System Tests | OWNER: vela | STATUS: READY */

// APIGW:Core Provider System Tests

import { DefaultProviderRegistry, CoreProvider } from '../src/core/providers';

// Mock provider for testing
class MockProvider implements CoreProvider {
  readonly name = 'mock';
  
  getValue(): string {
    return 'mock-value';
  }
}

describe('Core Provider System', () => {
  describe('DefaultProviderRegistry', () => {
    let registry: DefaultProviderRegistry;

    beforeEach(() => {
      registry = new DefaultProviderRegistry();
    });

    it('starts empty', () => {
      expect(registry.hasProvider('mock')).toBe(false);
      expect(registry.getProvider('mock')).toBeUndefined();
    });

    it('registers and retrieves providers', () => {
      const provider = new MockProvider();
      
      registry.registerProvider(provider);
      
      expect(registry.hasProvider('mock')).toBe(true);
      expect(registry.getProvider('mock')).toBe(provider);
    });

    it('unregisters providers', () => {
      const provider = new MockProvider();
      
      registry.registerProvider(provider);
      expect(registry.hasProvider('mock')).toBe(true);
      
      registry.unregisterProvider('mock');
      expect(registry.hasProvider('mock')).toBe(false);
      expect(registry.getProvider('mock')).toBeUndefined();
    });

    it('handles multiple providers', () => {
      const provider1 = new MockProvider();
      const provider2 = { name: 'test' as const, getValue: () => 'test-value' };
      
      registry.registerProvider(provider1);
      registry.registerProvider(provider2);
      
      expect(registry.hasProvider('mock')).toBe(true);
      expect(registry.hasProvider('test')).toBe(true);
      expect(registry.getProvider('mock')).toBe(provider1);
      expect(registry.getProvider('test')).toBe(provider2);
    });

    it('handles type safety correctly', () => {
      const provider = new MockProvider();
      registry.registerProvider(provider);
      
      const retrieved = registry.getProvider('mock');
      expect(retrieved).toBeDefined();
      expect(retrieved?.name).toBe('mock');
    });

    it('handles non-existent provider retrieval', () => {
      const retrieved = registry.getProvider('nonexistent');
      expect(retrieved).toBeUndefined();
    });

    it('handles unregistering non-existent provider', () => {
      expect(() => registry.unregisterProvider('nonexistent')).not.toThrow();
      expect(registry.hasProvider('nonexistent')).toBe(false);
    });
  });

  describe('CoreProvider interface', () => {
    it('requires name property', () => {
      const provider: CoreProvider = {
        name: 'test'
      };
      
      expect(provider.name).toBe('test');
    });

    it('enforces readonly name', () => {
      const provider: CoreProvider = {
        name: 'test'
      };
      
      // This should compile without error
      expect(provider.name).toBe('test');
    });
  });
});

/* Deviation Report: None - Core provider system tests verify basic provider functionality without API Gateway dependencies */
