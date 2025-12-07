# Infrastructure as Code - Monitoring Stack

Automated deployment of a production monitoring system using Terraform and Docker Compose.

## Architecture

- **Terraform**: Provisions VPS infrastructure on DigitalOcean/Hetzner
- **Docker Compose**: Orchestrates monitoring services
- **Prometheus**: Metrics collection and storage
- **Grafana**: Visualization and dashboards
- **Node.js App**: Sample application with metrics endpoint

## Infrastructure

- VPS with Ubuntu 22.04
- Automated firewall configuration
- SSH key management
- Ports: 3000 (Grafana), 9090 (Prometheus), 3001 (App)

## Prerequisites

- Terraform >= 1.0
- DigitalOcean/Hetzner API token
- SSH key pair

## Setup

1. Clone repository
2. Create `terraform.tfvars`:
```hcl
do_token = "your_token_here"  # or hcloud_token for Hetzner
```
3. Deploy infrastructure:
```bash
terraform init
terraform apply
```

## Stack Deployment

After infrastructure is provisioned:
```bash
ssh root@SERVER_IP
# Install docker, deploy monitoring stack
```

## Project Structure
```
.
├── main.tf              # Infrastructure definition
├── variables.tf         # Variable declarations
├── terraform.tfvars     # Secret values (not in git)
├── monitoring-stack/
│   ├── docker-compose.yml
│   ├── prometheus.yml
│   └── app/
```

## Built For

DevOps learning project demonstrating:
- Infrastructure as Code
- Container orchestration
- Production monitoring
- Automated deployments
