# CSN Token Metadata Integration

## Overview
This document explains how metadata is integrated with the CSN token smart contract.

## Metadata Structure
The CSN token uses a custom metadata structure that includes:
- Token name and symbol
- Description and external URL
- Image URI
- Token properties (decimals, max supply)
- Custom attributes

## Files Created
1. `metadata/csn-token-metadata.json` - The metadata JSON file
2. `metadata/metadata-integration.rs` - Rust code for integration
3. `tools/update_metadata.js` - Script to update metadata
4. `tools/view_metadata.js` - Script to view current metadata

## Integration Steps
1. Add the metadata fields to your State struct
2. Update your initialize function to set default metadata
3. Optionally add an update_metadata function
4. Deploy the updated contract
5. Use the tools to manage metadata

## Metadata Standards
- Uses Token-2022 standard
- Compatible with Metaplex Digital Asset Standard (DAS)
- Supports off-chain metadata via JSON files
- Can be extended with additional attributes

## Security Considerations
- Only the mint authority can update metadata
- Metadata is stored on-chain for critical information
- Off-chain metadata can be updated independently
- Consider using IPFS for decentralized metadata storage

## Usage Examples
```bash
# Create metadata files
node tools/add_metadata_to_contract.js

# Update metadata
node tools/update_metadata.js

# View current metadata
node tools/view_metadata.js
```

## Next Steps
1. Upload metadata JSON to IPFS or your hosting service
2. Update the image URI to point to your actual logo
3. Customize the metadata attributes as needed
4. Test the metadata integration
5. Deploy to mainnet when ready
