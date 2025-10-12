/**
 * Settings Component Tests
 * Tests for Settings screen functionality including API key management,
 * cost warnings toggle, and session statistics display
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';
import Settings from './Settings.svelte';
import * as apiKeyStorage from '../lib/apiKeyStorage.js';
import * as settingsStorage from '../lib/settingsStorage.js';
import * as openai from '../lib/openai.js';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = value; },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();

global.localStorage = localStorageMock;

describe('Settings Component', () => {
  let mockOnClose;

  beforeEach(() => {
    mockOnClose = vi.fn();
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render settings header', () => {
      render(Settings, { props: { onClose: mockOnClose } });
      expect(screen.getByText('Settings')).toBeTruthy();
    });

    it('should render API key section', () => {
      render(Settings, { props: { onClose: mockOnClose } });
      expect(screen.getByText('API Key')).toBeTruthy();
      expect(screen.getByText('Current API Key')).toBeTruthy();
    });

    it('should render preferences section', () => {
      render(Settings, { props: { onClose: mockOnClose } });
      expect(screen.getByText('Preferences')).toBeTruthy();
      expect(screen.getByText('Enable Cost Warnings')).toBeTruthy();
    });

    it('should render close button', () => {
      render(Settings, { props: { onClose: mockOnClose } });
      const closeButtons = screen.getAllByText('Close');
      expect(closeButtons.length).toBeGreaterThan(0);
    });
  });

  describe('API Key Display', () => {
    it('should display "No API key set" when no key exists', () => {
      vi.spyOn(apiKeyStorage, 'getAPIKey').mockReturnValue(null);
      render(Settings, { props: { onClose: mockOnClose } });
      expect(screen.getByText('No API key set')).toBeTruthy();
    });

    it('should display masked API key when key exists', () => {
      const mockKey = 'sk-test123456789abcdefghijklmnopqrstuvwxyz';
      vi.spyOn(apiKeyStorage, 'getAPIKey').mockReturnValue(mockKey);

      render(Settings, { props: { onClose: mockOnClose } });

      // Should show masked format: sk-...xyz (last 6 chars)
      const maskedDisplay = screen.getByText(/sk-\.\.\./);
      expect(maskedDisplay).toBeTruthy();
    });
  });

  describe('Session Statistics', () => {
    it('should not display session stats when gameState is null', () => {
      render(Settings, { props: { onClose: mockOnClose, gameState: null } });
      expect(screen.queryByText('Current Session')).toBeFalsy();
    });

    it('should display session stats when gameState is provided', () => {
      const mockGameState = {
        estimatedCost: 0.123,
        currentTurn: 5,
        history: [1, 2, 3, 4, 5],
        totalTokens: 1500
      };

      render(Settings, { props: { onClose: mockOnClose, gameState: mockGameState } });

      expect(screen.getByText('Current Session')).toBeTruthy();
      expect(screen.getByText('$0.123')).toBeTruthy();
      expect(screen.getByText('5')).toBeTruthy(); // turns
      expect(screen.getByText('1,500')).toBeTruthy(); // tokens
    });
  });

  describe('Cost Warnings Toggle', () => {
    it('should display cost warnings toggle as checked by default', () => {
      vi.spyOn(settingsStorage, 'getSettings').mockReturnValue({ costWarningsEnabled: true });

      render(Settings, { props: { onClose: mockOnClose } });

      const toggle = screen.getByRole('checkbox');
      expect(toggle.checked).toBe(true);
    });

    it('should update settings when toggle is clicked', async () => {
      const updateSettingSpy = vi.spyOn(settingsStorage, 'updateSetting');
      vi.spyOn(settingsStorage, 'getSettings')
        .mockReturnValueOnce({ costWarningsEnabled: true })
        .mockReturnValueOnce({ costWarningsEnabled: false });

      const { component } = render(Settings, { props: { onClose: mockOnClose } });

      const toggle = screen.getByRole('checkbox');
      await fireEvent.click(toggle);

      expect(updateSettingSpy).toHaveBeenCalledWith('costWarningsEnabled', false);
    });
  });

  describe('Change API Key', () => {
    it('should show change API key form when button is clicked', async () => {
      render(Settings, { props: { onClose: mockOnClose } });

      const changeButton = screen.getByText('Change API Key');
      await fireEvent.click(changeButton);

      expect(screen.getByText('New API Key')).toBeTruthy();
      expect(screen.getByPlaceholderText('sk-...')).toBeTruthy();
    });

    it('should validate API key format before updating', async () => {
      render(Settings, { props: { onClose: mockOnClose } });

      const changeButton = screen.getByText('Change API Key');
      await fireEvent.click(changeButton);

      const input = screen.getByPlaceholderText('sk-...');
      const updateButton = screen.getByText('Update Key');

      // Try invalid key
      await fireEvent.input(input, { target: { value: 'invalid-key' } });
      await fireEvent.click(updateButton);

      await waitFor(() => {
        expect(screen.getByText(/Invalid API key format/)).toBeTruthy();
      });
    });

    it('should call validateAPIKey when valid format is provided', async () => {
      const validateSpy = vi.spyOn(openai, 'validateAPIKey').mockResolvedValue(undefined);
      const setSpy = vi.spyOn(apiKeyStorage, 'setAPIKey');

      render(Settings, { props: { onClose: mockOnClose } });

      const changeButton = screen.getByText('Change API Key');
      await fireEvent.click(changeButton);

      const input = screen.getByPlaceholderText('sk-...');
      const updateButton = screen.getByText('Update Key');

      const validKey = 'sk-test123456789abcdefghijklmnopqrstuvwxyz';
      await fireEvent.input(input, { target: { value: validKey } });
      await fireEvent.click(updateButton);

      await waitFor(() => {
        expect(validateSpy).toHaveBeenCalledWith(validKey);
        expect(setSpy).toHaveBeenCalledWith(validKey);
      });
    });

    it('should display error when API validation fails', async () => {
      vi.spyOn(openai, 'validateAPIKey').mockRejectedValue(new Error('Invalid key'));

      render(Settings, { props: { onClose: mockOnClose } });

      const changeButton = screen.getByText('Change API Key');
      await fireEvent.click(changeButton);

      const input = screen.getByPlaceholderText('sk-...');
      const updateButton = screen.getByText('Update Key');

      const validKey = 'sk-test123456789abcdefghijklmnopqrstuvwxyz';
      await fireEvent.input(input, { target: { value: validKey } });
      await fireEvent.click(updateButton);

      await waitFor(() => {
        expect(screen.getByText(/Invalid key/)).toBeTruthy();
      });
    });

    it('should allow canceling change API key', async () => {
      render(Settings, { props: { onClose: mockOnClose } });

      const changeButton = screen.getByText('Change API Key');
      await fireEvent.click(changeButton);

      expect(screen.getByText('New API Key')).toBeTruthy();

      const cancelButton = screen.getByText('Cancel');
      await fireEvent.click(cancelButton);

      // Form should be hidden
      expect(screen.queryByText('New API Key')).toBeFalsy();
    });
  });

  describe('Clear API Key', () => {
    it('should show confirmation modal when clear button is clicked', async () => {
      render(Settings, { props: { onClose: mockOnClose } });

      const clearButton = screen.getByText('Clear API Key');
      await fireEvent.click(clearButton);

      expect(screen.getByText('Clear API Key?')).toBeTruthy();
      expect(screen.getByText(/Are you sure/)).toBeTruthy();
    });

    it('should call removeAPIKey and onClose when confirmed', async () => {
      const removeSpy = vi.spyOn(apiKeyStorage, 'removeAPIKey');

      render(Settings, { props: { onClose: mockOnClose } });

      const clearButton = screen.getByText('Clear API Key');
      await fireEvent.click(clearButton);

      const confirmButton = screen.getByText('Clear Key');
      await fireEvent.click(confirmButton);

      expect(removeSpy).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalledWith({ apiKeyCleared: true });
    });

    it('should allow canceling clear confirmation', async () => {
      const removeSpy = vi.spyOn(apiKeyStorage, 'removeAPIKey');

      render(Settings, { props: { onClose: mockOnClose } });

      const clearButton = screen.getByText('Clear API Key');
      await fireEvent.click(clearButton);

      const cancelButton = screen.getAllByText('Cancel')[0]; // First cancel button
      await fireEvent.click(cancelButton);

      // Modal should be hidden
      expect(screen.queryByText('Clear API Key?')).toBeFalsy();
      // Remove should not have been called
      expect(removeSpy).not.toHaveBeenCalled();
    });
  });

  describe('How API Costs Work', () => {
    it('should toggle cost explanation when clicked', async () => {
      render(Settings, { props: { onClose: mockOnClose } });

      const toggleButton = screen.getByText('How API Costs Work');

      // Initially hidden
      expect(screen.queryByText(/Pricing \(as of January 2025\)/)).toBeFalsy();

      // Click to show
      await fireEvent.click(toggleButton);
      expect(screen.getByText(/Pricing \(as of January 2025\)/)).toBeTruthy();

      // Click to hide
      await fireEvent.click(toggleButton);
      expect(screen.queryByText(/Pricing \(as of January 2025\)/)).toBeFalsy();
    });

    it('should display pricing information', async () => {
      render(Settings, { props: { onClose: mockOnClose } });

      const toggleButton = screen.getByText('How API Costs Work');
      await fireEvent.click(toggleButton);

      expect(screen.getByText(/GPT-3.5 Turbo/)).toBeTruthy();
      expect(screen.getByText(/GPT-4 Turbo/)).toBeTruthy();
      expect(screen.getByText(/Typical adventure cost/)).toBeTruthy();
    });
  });

  describe('Close Functionality', () => {
    it('should call onClose when close icon is clicked', async () => {
      render(Settings, { props: { onClose: mockOnClose } });

      // Find the close button (X icon)
      const closeButton = screen.getByLabelText('Close settings');
      await fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledWith({});
    });

    it('should call onClose when back button is clicked', async () => {
      render(Settings, { props: { onClose: mockOnClose } });

      const backButton = screen.getByText('Close');
      await fireEvent.click(backButton);

      expect(mockOnClose).toHaveBeenCalledWith({});
    });

    it('should show "Back to Adventure" when gameState is provided', () => {
      const mockGameState = { estimatedCost: 0.1, currentTurn: 1, history: [] };
      render(Settings, { props: { onClose: mockOnClose, gameState: mockGameState } });

      expect(screen.getByText('Back to Adventure')).toBeTruthy();
    });
  });
});
