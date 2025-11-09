#!/bin/bash
# Script to test the database population

echo "======================================================================"
echo "Testing Database Population"
echo "======================================================================"

echo ""
echo "Step 1: Verifying test data statistics..."
docker exec roombooking_backend python3 verify_test_data.py

echo ""
echo "======================================================================"
echo ""
echo "Step 2: Testing database relationships..."
docker exec roombooking_backend python3 test_relationships.py

echo ""
echo "======================================================================"
echo "Testing completed!"
echo "======================================================================"
