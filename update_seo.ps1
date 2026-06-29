$filesData = @{
    "index.html" = @{
        Title = "SAINTS 2027 | International Conference on Sustainable Research"
        Desc = "Welcome to SAINTS 2027, the premier International Conference dedicated to sustainable research, hosted at CHRIST (Deemed to be University), Bengaluru."
        Keywords = "SAINTS 2027, International Conference, Sustainable Research, CHRIST University, Green Computing, Bengaluru"
        Url = "https://saints.christuniversity.in/"
        Breadcrumb = "Welcome to SAINTS 2027, the premier International Conference dedicated to sustainable research."
    }
    "about\index.html" = @{
        Title = "About SAINTS 2027 & CHRIST University"
        Desc = "Learn about SAINTS 2027, an international conference dedicated to sustainable research, and discover the host institution, CHRIST (Deemed to be University)."
        Keywords = "About SAINTS 2027, CHRIST University history, sustainable research, School of Sciences, international research partnerships"
        Url = "https://saints.christuniversity.in/about/"
        Breadcrumb = "Discover everything you need to know about SAINTS 2027 and the host institution."
    }
    "gallery\index.html" = @{
        Title = "Event Gallery | SAINTS 2027"
        Desc = "Explore the vibrant moments, inaugural events, and memorable highlights from the SAINTS 2027 International Conference in our photo gallery."
        Keywords = "SAINTS 2027 gallery, conference photos, event highlights, CHRIST University events, academic conference pictures"
        Url = "https://saints.christuniversity.in/gallery/"
        Breadcrumb = "Have a look at the memories we made and the knowledge we shared."
    }
    "publications\index.html" = @{
        Title = "Publications & Publishers | SAINTS 2027"
        Desc = "Discover the publication opportunities and tentative publishers partnered with the SAINTS 2027 International Conference for academic journals and proceedings."
        Keywords = "SAINTS 2027 publications, academic journals, conference proceedings, Scopus, research papers, publisher partners"
        Url = "https://saints.christuniversity.in/publications/"
        Breadcrumb = "Explore publication opportunities and tentative publishers partnered with SAINTS 2027."
    }
    "registration\index.html" = @{
        Title = "Conference Registration | SAINTS 2027"
        Desc = "Register for the SAINTS 2027 International Conference. Find details on registration fees, deadlines, and submission guidelines for authors and attendees."
        Keywords = "SAINTS 2027 registration, conference fees, early bird registration, paper submission, academic conference tickets"
        Url = "https://saints.christuniversity.in/registration/"
        Breadcrumb = "Registration for SAINTS 2027 is now open! Join us for a transformative conference experience."
    }
    "schedule\index.html" = @{
        Title = "Event Schedule & Agenda | SAINTS 2027"
        Desc = "View the official schedule and agenda for SAINTS 2027. Plan your attendance for keynote speeches, track presentations, and networking events."
        Keywords = "SAINTS 2027 schedule, conference agenda, keynote timings, technical sessions, event timeline"
        Url = "https://saints.christuniversity.in/schedule/"
        Breadcrumb = "Stay up to date with the official timeline, keynote speeches, and sessions."
    }
    "speakers\track-1\index.html" = @{
        Title = "Track 1 Speakers | SAINTS 2027"
        Desc = "Meet the esteemed speakers and presenters for Track 1 at the SAINTS 2027 International Conference on Sustainable Research."
        Keywords = "SAINTS 2027 speakers, Track 1, keynote speakers, academic presenters, sustainable research experts"
        Url = "https://saints.christuniversity.in/speakers/track-1/"
        Breadcrumb = "Meet the esteemed speakers and presenters for Track 1."
    }
    "speakers\track-2\index.html" = @{
        Title = "Track 2 Speakers | SAINTS 2027"
        Desc = "Meet the esteemed speakers and presenters for Track 2 at the SAINTS 2027 International Conference on Sustainable Research."
        Keywords = "SAINTS 2027 speakers, Track 2, keynote speakers, academic presenters, sustainable research experts"
        Url = "https://saints.christuniversity.in/speakers/track-2/"
        Breadcrumb = "Meet the esteemed speakers and presenters for Track 2."
    }
    "speakers\track-3\index.html" = @{
        Title = "Track 3 Speakers | SAINTS 2027"
        Desc = "Meet the esteemed speakers and presenters for Track 3 at the SAINTS 2027 International Conference on Sustainable Research."
        Keywords = "SAINTS 2027 speakers, Track 3, keynote speakers, academic presenters, sustainable research experts"
        Url = "https://saints.christuniversity.in/speakers/track-3/"
        Breadcrumb = "Meet the esteemed speakers and presenters for Track 3."
    }
    "speakers\track-4\index.html" = @{
        Title = "Track 4 Speakers | SAINTS 2027"
        Desc = "Meet the esteemed speakers and presenters for Track 4 at the SAINTS 2027 International Conference on Sustainable Research."
        Keywords = "SAINTS 2027 speakers, Track 4, keynote speakers, academic presenters, sustainable research experts"
        Url = "https://saints.christuniversity.in/speakers/track-4/"
        Breadcrumb = "Meet the esteemed speakers and presenters for Track 4."
    }
}

foreach ($file in $filesData.Keys) {
    $filePath = "D:\xampp\htdocs\clg_projects\saints2027\$file"
    if (Test-Path $filePath) {
        $content = Get-Content -Raw -Encoding UTF8 $filePath
        $data = $filesData[$file]

        $t = $data.Title
        $d = $data.Desc
        $k = $data.Keywords
        $u = $data.Url
        $b = $data.Breadcrumb

        # Update Head details
        $content = [regex]::Replace($content, '(?is)<title>.*?</title>', "<title>$t</title>")
        $content = [regex]::Replace($content, '(?is)<meta[^>]*name="description"[^>]*>', "<meta content=""$d"" name=""description"">")
        $content = [regex]::Replace($content, '(?is)<meta[^>]*name="keywords"[^>]*>', "<meta content=""$k"" name=""keywords"">")
        $content = [regex]::Replace($content, '(?is)<link[^>]*rel="canonical"[^>]*>', "<link rel=""canonical"" href=""$u"">")
        $content = [regex]::Replace($content, '(?is)<meta[^>]*property="og:title"[^>]*>', "<meta property=""og:title"" content=""$t"">")
        $content = [regex]::Replace($content, '(?is)<meta[^>]*property="og:description"[^>]*>', "<meta property=""og:description"" content=""$d"">")
        $content = [regex]::Replace($content, '(?is)<meta[^>]*property="og:url"[^>]*>', "<meta property=""og:url"" content=""$u"">")
        $content = [regex]::Replace($content, '(?is)<meta[^>]*name="twitter:title"[^>]*>', "<meta name=""twitter:title"" content=""$t"">")
        $content = [regex]::Replace($content, '(?is)<meta[^>]*name="twitter:description"[^>]*>', "<meta name=""twitter:description"" content=""$d"">")

        # Update Breadcrumb text
        if ($file -ne "index.html") {
            $breadcrumbPattern = '(?is)(<div class="col-lg-4[^>]*>.*?<p class="mb-0[^>]*>).*?(</p>.*?</div>)'
            if ($content -match $breadcrumbPattern) {
                $content = [regex]::Replace($content, $breadcrumbPattern, "`${1}$b`$2")
            }
        }

        Set-Content -Path $filePath -Value $content -Encoding UTF8
        Write-Host "Updated $file"
    } else {
        Write-Host "File not found: $filePath"
    }
}
