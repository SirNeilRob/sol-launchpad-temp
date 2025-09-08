#!/bin/bash

# CSN Token Quick Setup Script
# This script automates the setup process for testing the CSN token

set -e  # Exit on any error

echo "🚀 CSN Token Quick Setup"
echo "========================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    local missing_deps=()
    
    if ! command_exists node; then
        missing_deps+=("Node.js")
    else
        NODE_VERSION=$(node --version | cut -d'v' -f2)
        print_success "Node.js $NODE_VERSION found"
    fi
    
    if ! command_exists npm; then
        missing_deps+=("npm")
    else
        NPM_VERSION=$(npm --version)
        print_success "npm $NPM_VERSION found"
    fi
    
    if ! command_exists rustc; then
        missing_deps+=("Rust")
    else
        RUST_VERSION=$(rustc --version | cut -d' ' -f2)
        print_success "Rust $RUST_VERSION found"
    fi
    
    if ! command_exists solana; then
        missing_deps+=("Solana CLI")
    else
        SOLANA_VERSION=$(solana --version | cut -d' ' -f2)
        print_success "Solana CLI $SOLANA_VERSION found"
    fi
    
    if ! command_exists anchor; then
        missing_deps+=("Anchor Framework")
    else
        ANCHOR_VERSION=$(anchor --version | cut -d' ' -f2)
        print_success "Anchor $ANCHOR_VERSION found"
    fi
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        print_error "Missing dependencies: ${missing_deps[*]}"
        print_error "Please install missing dependencies before running this script"
        print_error "See SETUP_GUIDE.md for detailed installation instructions"
        exit 1
    fi
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    # Install root dependencies
    print_status "Installing root dependencies..."
    if npm install --legacy-peer-deps; then
        print_success "Root dependencies installed"
    else
        print_error "Failed to install root dependencies"
        exit 1
    fi
    
    # Install frontend dependencies
    if [ -d "app" ]; then
        print_status "Installing frontend dependencies..."
        cd app
        if npm install --legacy-peer-deps; then
            print_success "Frontend dependencies installed"
        else
            print_error "Failed to install frontend dependencies"
            exit 1
        fi
        cd ..
    fi
}

# Configure Solana
configure_solana() {
    print_status "Configuring Solana CLI..."
    
    # Set to devnet
    solana config set --url devnet
    print_success "Solana configured for devnet"
    
    # Check if keypair exists
    if [ ! -f ~/.config/solana/id.json ]; then
        print_status "Creating new Solana keypair..."
        solana-keygen new --outfile ~/.config/solana/id.json --no-bip39-passphrase
        print_success "New keypair created"
    else
        print_success "Existing keypair found"
    fi
    
    # Check balance and airdrop if needed
    BALANCE=$(solana balance --lamports)
    if [ "$BALANCE" -lt 1000000000 ]; then  # Less than 1 SOL
        print_status "Airdropping SOL..."
        solana airdrop 2
        print_success "SOL airdropped"
    else
        print_success "Sufficient SOL balance: $(solana balance)"
    fi
}

# Build the program
build_program() {
    print_status "Building Anchor program..."
    
    if anchor build; then
        print_success "Program built successfully"
    else
        print_error "Failed to build program"
        exit 1
    fi
}

# Run tests
run_tests() {
    print_status "Running tests..."
    
    if npm test; then
        print_success "All tests passed!"
    else
        print_warning "Some tests failed - check output above"
    fi
}

# Main setup function
main() {
    echo
    print_status "Starting CSN Token setup..."
    echo
    
    check_prerequisites
    echo
    
    install_dependencies
    echo
    
    configure_solana
    echo
    
    build_program
    echo
    
    run_tests
    echo
    
    print_success "Setup complete! 🎉"
    echo
    print_status "Next steps:"
    echo "1. Run 'cd app && npm run dev' to start the frontend"
    echo "2. Open http://localhost:5173 in your browser"
    echo "3. Connect your Phantom wallet"
    echo "4. Follow the launch wizard"
    echo
    print_status "For more information, see SETUP_GUIDE.md"
}

# Run main function
main "$@"