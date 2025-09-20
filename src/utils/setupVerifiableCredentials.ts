// Setup script for Verifiable Credentials system
import { keyManagementService } from '../services/keyManagementService';
import { verifiableCredentialService } from '../services/verifiableCredentialService';
import { supabase } from '../integrations/supabase/client';

export const setupVerifiableCredentials = async () => {
  try {
    console.log('Setting up Verifiable Credentials system...');

    // Check if default issuer exists
    const { data: existingIssuer, error: issuerError } = await supabase
      .from('issuers')
      .select('id')
      .eq('id', '00000000-0000-0000-0000-000000000001')
      .single();

    if (issuerError && issuerError.code === 'PGRST116') {
      console.log('Creating default issuer...');
      
      // Create default issuer
      const issuer = await keyManagementService.createIssuer(
        'Smart Student Hub',
        'did:example:smarthub'
      );
      
      console.log('Default issuer created:', issuer.id);
    } else if (existingIssuer) {
      console.log('Default issuer already exists');
    }

    console.log('Verifiable Credentials system setup complete!');
    return true;
  } catch (error) {
    console.error('Error setting up Verifiable Credentials:', error);
    return false;
  }
};

// Auto-setup when imported
if (typeof window !== 'undefined') {
  // Only run in browser environment
  setupVerifiableCredentials().catch(console.error);
}

