curl -X POST http://localhost:3000/api/v1/activities \
-H "Content-Type: application/json" \
-d '{
  "category": "transport",
  "subCategory": "medium_gasoline_car",
  "amount": 45.0,
  "timestamp": "2026-06-09T12:00:00-04:00"
}'