<script>
  // Svelte 5 runes mode: use $props() instead of export let
  let { onKeySet = (key) => {} } = $props();

  let apiKey = $state('');
  let keyStatus = $state(''); // '', 'checking', 'valid', 'invalid'
  let errorMessage = $state('');

  // Validate key format before testing
  function validateKeyFormat(key) {
    if (!key) {
      return { valid: false, error: 'Please enter an API key' };
    }

    if (!key.startsWith('sk-')) {
      return { valid: false, error: 'Key must start with "sk-"' };
    }

    if (key.length < 40) {
      return { valid: false, error: 'Key appears too short' };
    }

    return { valid: true };
  }

  // Test key against OpenAI API (via proxy)
  async function testKey(key) {
    try {
      const response = await fetch('/api/openai/v1/models', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${key}`
        }
      });

      if (response.ok) {
        return { valid: true };
      } else if (response.status === 401) {
        return { valid: false, error: 'Invalid API key. Please check your key in OpenAI dashboard.' };
      } else if (response.status === 429) {
        return { valid: false, error: 'Rate limit exceeded. Please wait a moment and try again.' };
      } else {
        return { valid: false, error: `API error: ${response.status}` };
      }
    } catch (error) {
      return { valid: false, error: 'Network error. Please check your connection.' };
    }
  }

  async function handleSubmit() {
    // Format validation
    const formatCheck = validateKeyFormat(apiKey);
    if (!formatCheck.valid) {
      keyStatus = 'invalid';
      errorMessage = formatCheck.error;
      return;
    }

    // API validation
    keyStatus = 'checking';
    errorMessage = '';

    const apiCheck = await testKey(apiKey);

    if (apiCheck.valid) {
      keyStatus = 'valid';
      onKeySet(apiKey);
    } else {
      keyStatus = 'invalid';
      errorMessage = apiCheck.error;
    }
  }

  function handleKeyPress(e) {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  }
</script>

<div class="api-key-container">
  <div class="header">
    <h2>🔑 Enter Your OpenAI API Key</h2>
  </div>

  <div class="security-notice">
    <div class="security-icon">🔒</div>
    <div class="security-text">
      <strong>Your key is secure:</strong> It's stored only in your browser's memory
      and used directly to call OpenAI's API. It never touches our servers and
      disappears when you close this tab.
    </div>
  </div>

  <div class="key-input-group">
    <label for="api-key">OpenAI API Key</label>
    <div class="input-row">
      <input
        id="api-key"
        type="password"
        bind:value={apiKey}
        onkeypress={handleKeyPress}
        placeholder="sk-proj-..."
        autocomplete="off"
        spellcheck="false"
        disabled={keyStatus === 'checking'}
      />

      <button
        onclick={handleSubmit}
        disabled={!apiKey || keyStatus === 'checking'}
        class="validate-btn"
      >
        {keyStatus === 'checking' ? '⏳ Validating...' : 'Validate Key'}
      </button>
    </div>
  </div>

  {#if keyStatus === 'valid'}
    <div class="status-message success">
      <span class="status-icon">✅</span>
      <span class="status-text">Key is valid! You're ready to create worlds.</span>
    </div>
  {/if}

  {#if keyStatus === 'invalid'}
    <div class="status-message error">
      <span class="status-icon">❌</span>
      <span class="status-text">{errorMessage}</span>
    </div>
  {/if}

  <details class="help-section">
    <summary>🤔 How to get an OpenAI API key</summary>
    <div class="help-content">
      <ol>
        <li>Go to <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">platform.openai.com/api-keys</a></li>
        <li>Sign in or create an OpenAI account</li>
        <li>Click <strong>"Create new secret key"</strong></li>
        <li>Give it a name (e.g., "Worldbuilding App")</li>
        <li>
          <strong>Important:</strong> Set spending limits in
          <a href="https://platform.openai.com/settings/organization/limits" target="_blank" rel="noopener noreferrer">Settings → Limits</a>
          ($5-10 recommended)
        </li>
        <li>Copy the key and paste it above</li>
      </ol>

      <div class="security-tips">
        <h4>🔐 Security Tips:</h4>
        <ul>
          <li>Set spending limits to protect your account</li>
          <li>Create a key just for this app (don't reuse keys)</li>
          <li>Never share your key with anyone</li>
          <li>You can revoke the key anytime in OpenAI's dashboard</li>
        </ul>
      </div>
    </div>
  </details>

  <div class="cost-info">
    <h4>💰 Cost Information</h4>
    <p>
      Each world generation costs approximately <strong>$0.10-0.15</strong>
      using your OpenAI API key. OpenAI charges are billed directly to your account.
    </p>
  </div>
</div>

<style>
  .api-key-container {
    max-width: 600px;
    margin: 0 auto;
    padding: 2rem;
  }

  .header h2 {
    margin: 0 0 1.5rem 0;
    font-size: 1.75rem;
    color: #1a1a1a;
    text-align: center;
  }

  .security-notice {
    display: flex;
    gap: 1rem;
    background: #e3f2fd;
    border-left: 4px solid #2196f3;
    padding: 1rem;
    margin-bottom: 2rem;
    border-radius: 4px;
  }

  .security-icon {
    font-size: 1.5rem;
    flex-shrink: 0;
  }

  .security-text {
    font-size: 0.9rem;
    line-height: 1.5;
    color: #1565c0;
  }

  .security-text strong {
    color: #0d47a1;
  }

  .key-input-group {
    margin-bottom: 1.5rem;
  }

  .key-input-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 600;
    color: #333;
  }

  .input-row {
    display: flex;
    gap: 0.5rem;
  }

  input {
    flex: 1;
    padding: 0.75rem;
    border: 2px solid #ddd;
    border-radius: 6px;
    font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
    font-size: 0.9rem;
    transition: border-color 0.2s;
  }

  input:focus {
    outline: none;
    border-color: #2196f3;
  }

  input:disabled {
    background: #f5f5f5;
    cursor: not-allowed;
  }

  .validate-btn {
    padding: 0.75rem 1.5rem;
    background: #2196f3;
    color: white;
    border: none;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
    white-space: nowrap;
  }

  .validate-btn:hover:not(:disabled) {
    background: #1976d2;
  }

  .validate-btn:disabled {
    background: #ccc;
    cursor: not-allowed;
  }

  .status-message {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem;
    border-radius: 6px;
    margin-bottom: 1.5rem;
    animation: slideIn 0.3s ease-out;
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .status-message.success {
    background: #e8f5e9;
    border: 1px solid #4caf50;
  }

  .status-message.error {
    background: #ffebee;
    border: 1px solid #f44336;
  }

  .status-icon {
    font-size: 1.25rem;
  }

  .status-text {
    flex: 1;
    font-size: 0.95rem;
  }

  .status-message.success .status-text {
    color: #2e7d32;
  }

  .status-message.error .status-text {
    color: #c62828;
  }

  .help-section {
    margin-bottom: 1.5rem;
    border: 1px solid #ddd;
    border-radius: 6px;
    overflow: hidden;
  }

  .help-section summary {
    padding: 1rem;
    cursor: pointer;
    background: #f5f5f5;
    font-weight: 600;
    color: #555;
    user-select: none;
    transition: background 0.2s;
  }

  .help-section summary:hover {
    background: #ececec;
  }

  .help-content {
    padding: 1.5rem;
    background: white;
  }

  .help-content ol {
    margin: 0 0 1.5rem 0;
    padding-left: 1.5rem;
  }

  .help-content li {
    margin-bottom: 0.75rem;
    line-height: 1.6;
  }

  .help-content a {
    color: #2196f3;
    text-decoration: none;
  }

  .help-content a:hover {
    text-decoration: underline;
  }

  .security-tips {
    background: #fff3e0;
    padding: 1rem;
    border-radius: 4px;
    border-left: 4px solid #ff9800;
  }

  .security-tips h4 {
    margin: 0 0 0.75rem 0;
    color: #e65100;
    font-size: 0.95rem;
  }

  .security-tips ul {
    margin: 0;
    padding-left: 1.5rem;
  }

  .security-tips li {
    margin-bottom: 0.5rem;
    color: #e65100;
    font-size: 0.9rem;
  }

  .cost-info {
    background: #f5f5f5;
    padding: 1rem;
    border-radius: 6px;
    border-left: 4px solid #9e9e9e;
  }

  .cost-info h4 {
    margin: 0 0 0.5rem 0;
    font-size: 0.95rem;
    color: #555;
  }

  .cost-info p {
    margin: 0;
    font-size: 0.9rem;
    color: #666;
    line-height: 1.5;
  }

  .cost-info strong {
    color: #333;
  }
</style>
