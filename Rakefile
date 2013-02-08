task :default => [:thoughts]

TEXTFILES = FileList["random\ thoughts/*.txt"]
HTMLS = TEXTFILES.ext('html')

task :thoughts => HTMLS do
  # print "in thoughts\n"
end

rule '.html' => '.txt' do |t|
  puts t.source
end