# Page snapshot

```yaml
- main [ref=e3]:
  - generic [ref=e4]:
    - button "Settings" [ref=e6]:
      - img [ref=e7]
    - generic [ref=e10]:
      - generic [ref=e11]:
        - heading "AI Adventure Engine" [level=1] [ref=e12]
        - paragraph [ref=e13]: Enter your API key to begin
      - generic [ref=e15]:
        - generic [ref=e16]:
          - generic [ref=e17]: OpenAI API Key
          - textbox "OpenAI API Key" [active] [ref=e18]:
            - /placeholder: sk-...
            - text: sk-invalid-key-123
        - button "Continue" [disabled] [ref=e19]
      - button "Need an API key?" [ref=e21]
```