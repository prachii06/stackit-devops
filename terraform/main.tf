#s3 bucket
resource "aws_s3_bucket" "frontend_bucket" {
    bucket = var.bucket_name

    tags = {
        Name = "StackIt Frontend"
        Project = "StackIt"
    }
}

#secure s3 bucket
resource "aws_s3_bucket_acl" "frontend_bucket_acl" {
    bucket = aws_s3_bucket.frontend_bucket.id
    acl = "private"
}

#identity for cloudfront to access s3 bucket
resource "aws_cloudfront_origin_access_control" "s3_oac" {
    name                              = "StackIt-s3-OAC"
    description                       = "Origin Access Control for StackIt S3 bucket"
    origin_access_control_origin_type = "s3"
    signing_behavior                  = "always"
    signing_protocol                  = "sigv4"
}

#cloudfront with 2 origins
resource "aws_cloudfront_distribution" "main_distribution" {
    enabled             = true
    default_root_object = "index.html"

    #origin-1 (s3 bucket)
    origin {
        domain_name              = aws_s3_bucket.frontend_bucket.bucket_regional_domain_name
        origin_id                = "S3-StackIt-Frontend"
        origin_access_control_id = aws_cloudfront_origin_access_control.s3_oac.id
    }

    #origin-2 (ec2 api gateway)
    origin {
        domain_name = aws_eip.stackit_ip.public_ip
        origin_id   = "EC2-StackIt-Backend"
        custom_origin_config {
            http_port              = 8000
            https_port             = 443
            origin_protocol_policy = "http-only"
            origin_ssl_protocols   = ["TLSv1.2"]
        }
    }

    #default cache behaviour
    default_cache_behavior {
        target_origin_id       = "S3-StackIt-Frontend"
        allowed_methods        = ["GET", "HEAD", "OPTIONS"]
        cached_methods         = ["GET", "HEAD"]
        viewer_protocol_policy = "redirect-to-https"
        forwarded_values {
            query_string = false 
            headers      = ["Origin"]
            cookies {
                forward = "none"
            }
        }
    }

    #if the url starts with /api/ send it to ec2 backend
    ordered_cache_behavior {
        path_pattern           = "/api/*"
        target_origin_id       = "EC2-StackIt-Backend"
        allowed_methods        = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
        cached_methods         = ["GET", "HEAD", "OPTIONS"]
        viewer_protocol_policy = "redirect-to-https"
        forwarded_values {
            query_string = true
            headers      = ["*"]
            cookies {
                forward = "all"
            }
        }
    }

    restrictions {
        geo_restriction {
            restriction_type = "none"
        }
    }

    viewer_certificate {
        cloudfront_default_certificate = true
    }
}

#ecr repo
resource "aws_ecr_repository" "backend_repo" {
    name = var.ecr_repo_name

    tags = {
        Name = "StackIt Backend Repo"
        Project = "StackIt"
    }
}
