#!/bin/bash
echo "Waiting for MongoDB nodes to be ready..."

until mongosh --host mongo1:27017 --eval "db.adminCommand('ping')" >/dev/null 2>&1; do
  echo "mongo1 not ready yet..."
  sleep 2
done

until mongosh --host mongo2:27018 --eval "db.adminCommand('ping')" >/dev/null 2>&1; do
  echo "mongo2 not ready yet..."
  sleep 2
done

until mongosh --host mongo3:27019 --eval "db.adminCommand('ping')" >/dev/null 2>&1; do
  echo "mongo3 not ready yet..."
  sleep 2
done

echo "All MongoDB nodes are responding. Initializing replica set..."

mongosh --host mongo1:27017 <<EOF
rs.initiate({
  _id: "rs0",
  members: [
    { _id: 0, host: "mongo1:27017" },
    { _id: 1, host: "mongo2:27018" },
    { _id: 2, host: "mongo3:27019" }
  ]
});
EOF

echo "Replica set initialized. Checking status..."

mongosh --host mongo1:27017 --eval "printjson(rs.status())"

echo "MongoDB Replica Set is ready!"
