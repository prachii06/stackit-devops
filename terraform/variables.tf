variable "bucket_name" {
  description = "The unique name for the S3 bucket."
  type        = string
  default     = "stackit-frontend"
}

variable "ecr_repo_name" {
  description = "the name for ecr repository"
   type       = string
   default    = "stackit-backend-repo"
}

variable "db_username" {
  description = "Username for the RDS database."
  type        = string
  default     = "stackit_admin"
}

variable "db_password" {
  description = "Password for the RDS database."
  type        = string
  sensitive   = true #to hide password in output
}