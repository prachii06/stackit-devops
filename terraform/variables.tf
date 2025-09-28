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