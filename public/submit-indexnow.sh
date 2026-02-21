#!/bin/bash
KEY="a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
URL1="https://convertisseur-xof.vercel.app/"
URL2="https://convertisseur-xof.vercel.app/blog"

curl "https://api.indexnow.org/indexnow?url=${URL1}&key=${KEY}"
curl "https://api.indexnow.org/indexnow?url=${URL2}&key=${KEY}"
