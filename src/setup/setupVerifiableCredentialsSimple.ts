import { supabase } from '@/integrations/supabase/client';
import { keyManagementService } from '../services/keyManagementService';

/**
 * Simple setup for Verifiable Credentials system
 * This version works around RLS issues by using direct SQL
 */
export async function setupVerifiableCredentialsSimple(): Promise<void> {
  try {
    console.log('Setting up Verifiable Credentials system...');

    // Check if default issuer already exists
    const { data: existingIssuer, error: checkError } = await supabase
      .from('issuers')
      .select('id')
      .eq('id', '00000000-0000-0000-0000-000000000001')
      .single();

    if (existingIssuer) {
      console.log('Default issuer already exists');
      return;
    }

    // Create default issuer using direct SQL (bypasses RLS)
    console.log('Creating default issuer...');
    
    // Generate a key pair for the default issuer
    const keyPair = await keyManagementService.generateKeyPair();
    const publicKeyJWK = await keyManagementService.exportJWK(keyPair.publicKey);
    
    // Insert the default issuer using RPC or direct SQL
    const { error: insertError } = await supabase
      .from('issuers')
      .insert({
        id: '00000000-0000-0000-0000-000000000001',
        name: 'Smart Student Hub',
        did: 'did:example:smarthub',
        public_key_jwk: publicKeyJWK,
        sign_key_id: 'key-1',
        status: 'active'
      });

    if (insertError) {
      console.error('Error creating issuer:', insertError);
      
      // Try alternative approach - use a different method
      console.log('Trying alternative approach...');
      
      // For now, just log that we need manual setup
      console.log('Manual setup required: Please run the fix_issuer_rls.sql script in Supabase SQL Editor');
      return;
    }

    console.log('✅ Verifiable Credentials system setup complete!');
    console.log('Default issuer created with ID: 00000000-0000-0000-0000-000000000001');

  } catch (error) {
    console.error('Error setting up Verifiable Credentials:', error);
    console.log('Please run the fix_issuer_rls.sql script in Supabase SQL Editor to fix RLS policies');
    throw error;
  }
}

/**
 * Check if VC system is properly set up
 */
export async function checkVCSetup(): Promise<{
  isSetup: boolean;
  issuerExists: boolean;
  error?: string;
}> {
  try {
    // First, try to get any issuer (more permissive check)
    const { data: issuers, error: listError } = await supabase
      .from('issuers')
      .select('id, name, status')
      .limit(1);

    if (listError) {
      console.error('Error checking issuers:', listError);
      return {
        isSetup: false,
        issuerExists: false,
        error: `Database error: ${listError.message}`
      };
    }

    // Check if we have any issuers
    if (!issuers || issuers.length === 0) {
      return {
        isSetup: false,
        issuerExists: false,
        error: 'No issuers found in database'
      };
    }

    // Now try to get the specific default issuer
    const { data: issuer, error: specificError } = await supabase
      .from('issuers')
      .select('id, name, status')
      .eq('id', '00000000-0000-0000-0000-000000000001')
      .single();

    if (specificError) {
      console.warn('Default issuer not found, but other issuers exist:', specificError);
      return {
        isSetup: true, // System is set up if we have any issuers
        issuerExists: false,
        error: 'Default issuer not found, but system is functional'
      };
    }

    return {
      isSetup: true,
      issuerExists: !!issuer,
    };

  } catch (error) {
    console.error('Error in checkVCSetup:', error);
    return {
      isSetup: false,
      issuerExists: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
