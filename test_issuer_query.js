// Test script to verify issuer query works
// Run this in browser console to test the issuer query

async function testIssuerQuery() {
  try {
    console.log('Testing issuer query...');
    
    // Test the exact query from the service
    const { data: issuerData, error: issuerError } = await supabase
      .from('issuers')
      .select('id, name, did, sign_key_id')
      .eq('status', 'active')
      .single();

    console.log('Issuer query result:', { issuerData, issuerError });
    
    if (issuerError) {
      console.error('❌ Issuer query failed:', issuerError);
      return false;
    }
    
    if (!issuerData) {
      console.error('❌ No active issuer found');
      return false;
    }
    
    console.log('✅ Active issuer found:', issuerData);
    return true;
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
}

// Run the test
testIssuerQuery();
