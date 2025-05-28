-- Enable Row Level Security on ai_models table
ALTER TABLE ai_models ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can perform all operations on ai_models
CREATE POLICY "Admins can manage ai_models" ON ai_models
  FOR ALL
  TO authenticated
  USING (is_current_user_admin())
  WITH CHECK (is_current_user_admin());

-- Policy: Authenticated users can read active AI models
CREATE POLICY "Authenticated users can read active ai_models" ON ai_models
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Policy: Anonymous users can read active AI models (for public tool pages)
CREATE POLICY "Anonymous users can read active ai_models" ON ai_models
  FOR SELECT
  TO anon
  USING (is_active = true); 